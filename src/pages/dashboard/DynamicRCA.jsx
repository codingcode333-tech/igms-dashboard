import React, { useState } from 'react';
import { getDynamicRca, getGrievancesUsingRegNos, getSemanticRca } from '@/services/rca';
import { BreadCrumbs, Chart } from './CategoricalTree';
import { AILoader, GrievanceListBox } from '@/widgets/grievance/RCA/semantic';
import { Filters, getDefaultDepartmentOrFiller } from '@/widgets/grievance/RCA/dynamic';
import { toast } from 'react-toastify';
import { getDefaultDepartment, getDepartmentList } from '@/data';
import { RCALeaf, StatusBar } from '@/widgets/rca/components';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import ProgressBar from '@/widgets/others/ApiProgressBar';

const DynamicRCA = () => {
    const [data, setData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [parameters, setParameters] = useState({ clusters: 11, ministry: getDefaultDepartmentOrFiller("CBODT") });
    const [transactionIds, setTransactionIds] = useState([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [emptyResult, setEmptyResult] = useState(false)
    const batchSize = 20;
    const rowsPerPage = 20;
    const [breadcrumbs, setBreadcrumbs] = useState([])
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [durationFactor, setDurationFactor] = useState(5_000) // In Milli seconds

    const fetchData = async (params, idList = null, keywords = null, crumbs = breadcrumbs) => {
        setLoading(true);
        setError(null);
        try {
            if (params.startDate && params.endDate) {
                setDurationFactor(
                    (
                        (new Date(params.endDate) - new Date(params.startDate))
                        / (1_000 * 60 * 60 * 24 * 28)
                    )
                    * 60 * 1_000 * 2 // Considering, 1 months takes 2 minutes
                )
            }

            const response = await getDynamicRca({
                ...params,
                number_of_clusters: params.clusters,
                registration_no_list: idList ?? ["NA"]
            })

            let treeData = response.data;

            if (treeData === 'No More Level') {
                setData([]);
                alert('No more Levels');
                return;
            }

            treeData = Object.values(treeData)

            let isEndNode = false

            if (idList && treeData.length == 0) {
                toast.warning("Reached last leaf node.")

                const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1]

                treeData = lastBreadcrumb.treeData

                isEndNode = true
            }

            // if (treeData.registration_no_list !== 'NA') {
            setEmptyResult(treeData.length == 0)

            const ids = treeData.map(({ doc_ids }) => doc_ids).flat()

            setTransactionIds(ids);
            setCurrentBatchIndex(0);
            fetchBatch(ids.slice(0, batchSize));

            if (!isEndNode) {
                if (keywords) {
                    setBreadcrumbs([
                        ...crumbs,
                        {
                            params,
                            treeData,
                            keywords
                        }
                    ])
                }
                else {
                    setBreadcrumbs([
                        {
                            params,
                            treeData,
                            keywords: params.ministry
                        }
                    ])
                }
            }
            // }
            // console.log(treeData.category_with_count)
            const formattedData = treeData.map(({ words, count, doc_ids }) => ({ x: words.join(', '), y: count, doc_ids }))
            // const formattedData = Object.keys(treeData.category_with_count).map(key => ({
            //     x: key,
            //     y: treeData.category_with_count[key],
            // }));

            setData([{ data: formattedData }]);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBatch = async (ids) => {
        const formattedTransactionIds = ids.map(id => `"${id}"`).join(',');
        const encodedTransactionIds = encodeURIComponent(formattedTransactionIds);
        const apiUrl = `http://172.30.0.186:5002/get_userdata/?transaction_ids=${encodedTransactionIds}&startDate=2024-07-01&endDate=2024-07-13`;

        try {
            // const response = await fetch(apiUrl, { method: 'GET' });

            setIsTableLoading(true)

            const response = await getGrievancesUsingRegNos(ids)

            setIsTableLoading(false)
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            const data = response.data //await response.json();

            setTableData(Object.values(data.data));
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const handleTileClick = (dataPointIndex) => {
        if (dataPointIndex === undefined || dataPointIndex < 0) return;
        const clickedCategory = data[0].data[dataPointIndex];
        console.log(clickedCategory, 'acc')
        // const newParams = {
        //     ...parameters
        // };

        setData([]) // Hiding Chart
        const subIds = clickedCategory.doc_ids
        const keywords = clickedCategory.x
        // setTransactionIds(subIds)
        // setBreadcrumbs([
        //     ...breadcrumbs,
        //     {
        //         params: {
        //             ministry: clickedCategory.x
        //         }
        //     }
        // ])

        // fetchBatch(subIds.slice(0, batchSize))
        // setParameters(newParams);
        fetchData(parameters, subIds, keywords);
    };

    const handleBatchChange = (direction) => {
        let newBatchIndex = currentBatchIndex;
        if (direction === 'next') {
            newBatchIndex += batchSize;
        } else if (direction === 'prev') {
            newBatchIndex -= batchSize;
        }

        newBatchIndex = Math.max(newBatchIndex, 0);
        newBatchIndex = Math.min(newBatchIndex, transactionIds.length - batchSize);

        if (newBatchIndex !== currentBatchIndex) {
            setCurrentBatchIndex(newBatchIndex);
            fetchBatch(transactionIds.slice(newBatchIndex, newBatchIndex + batchSize));
        }
    };

    const goTo = (pageno) => {
        setCurrentBatchIndex(pageno - 1)
        fetchBatch(transactionIds.slice((pageno - 1) * batchSize, pageno * batchSize))
    }

    const handleFormSubmit = (params) => {
        setParameters(params);
        fetchData(params);
    };

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = tableData.slice(startIndex, startIndex + rowsPerPage);

    const updatePathLength = (length) => {
        const newBreadcrumbs = breadcrumbs.slice(0, length + 1)

        const currentBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1]
        const previousBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1 - 1]

        // setTransactionIds(previousBreadcrumb?.registration_no_list ?? ['NA'])

        setParameters({
            ...currentBreadcrumb?.params
        })

        setTimeout(() => {
            fetchData(currentBreadcrumb?.params, previousBreadcrumb?.treeData.map(({ doc_ids }) => doc_ids).flat() ?? ["NA"], currentBreadcrumb?.keywords, newBreadcrumbs)
        }, 200)
    }

    return (
        <div className="p-4">
            {/* <ParameterForm onSubmit={handleFormSubmit} /> */}
            <Filters filters={parameters} setFilters={handleFormSubmit} />

            {/* <RCALeaf max={30} current={26} value={""} ministry={parameters.ministry} /> */}

            {loading && <ProgressBar totalDuration={durationFactor} />}

            {/* {loading && <AILoader />} */}

            {emptyResult && !loading && <p className="text-red-900">No data found.</p>}

            {
                !loading && !emptyResult &&
                <>
                    <Chart
                        series={data}
                        pushPath={handleTileClick}
                    />

                    <BreadCrumbs
                        list={breadcrumbs.map(({ keywords }) => keywords)}
                        setPathLength={updatePathLength}
                    />

                    {
                        !loading && !emptyResult && paginatedData.length > 0 &&
                        <GrievanceListBox
                            list={paginatedData}
                            total={transactionIds.length}
                            pageno={currentBatchIndex + 1}
                            goTo={goTo}
                            searching={isTableLoading}
                        />
                    }
                </>
            }
        </div>
    );
};


export default DynamicRCA;
