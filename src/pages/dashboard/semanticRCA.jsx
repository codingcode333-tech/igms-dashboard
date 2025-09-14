import React, { useState } from 'react';
import { getGrievancesUsingRegNos, getSemanticRca, getCachedRCA, searchGrievancesUsingCDIS } from '@/services/rca';
import { BreadCrumbs, Chart } from './CategoricalTree';
import { AILoader, Filters, GrievanceListBox } from '@/widgets/grievance/RCA/semantic';
import { getDefaultDepartmentOrFiller } from '@/widgets/grievance/RCA/dynamic';
import ProgressBar from '@/widgets/others/ApiProgressBar';
import './css/semantic-rca.css';

const SemanticRCA = () => {
    const [data, setData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [parameters, setParameters] = useState({ 
        level: 2, 
        threshold: 1.3, 
        ministry: 'DOCAF',
        startDate: '2016-08-01',
        endDate: '2016-08-31'
    });
    const [transactionIds, setTransactionIds] = useState([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [emptyResult, setEmptyResult] = useState(false)
    const batchSize = 20;
    const rowsPerPage = 20;
    const [breadcrumbs, setBreadcrumbs] = useState([])
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [durationFactor, setDurationFactor] = useState(5_000) // In Milli seconds

    const fetchData = async (params) => {
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
            
            // First try the original semantic RCA API
            let response = await getSemanticRca({
                ...params,
                registration_no_list: transactionIds.length > 0 ? transactionIds : ["NA"]
            })
            let treeData = response.data;
            console.log('SemanticRCA API Response:', treeData)
            
            // If original API returns only success, try CDIS RCA API as fallback
            if (treeData && treeData.success && !treeData.registration_no_list && !treeData.category_with_count) {
                console.warn('Original API returned only success, trying CDIS approach...');
                
                // Check if user provided a search query for semantic search
                if (params.searchQuery && params.searchQuery.trim()) {
                    console.log('🧠 Using CDIS Semantic Search for query:', params.searchQuery);
                    
                    try {
                        const semanticResponse = await searchGrievancesUsingCDIS(params.searchQuery, {
                            value: params.searchType || 1, // Use user-selected search type
                            size: 100, // Get more results for analysis
                            threshold: params.threshold || 1.5
                        });
                        
                        if (semanticResponse?.data && Array.isArray(semanticResponse.data) && semanticResponse.data.length > 0) {
                            console.log('✅ Semantic search found', semanticResponse.data.length, 'relevant grievances');
                            
                            // Group grievances by relevant categories (company, complaint type, etc.)
                            const categoryGroups = {};
                            const registration_no_list = [];
                            
                            semanticResponse.data.forEach(item => {
                                registration_no_list.push(item.id);
                                
                                // Group by company name
                                const company = item.companyName || 'Unknown Company';
                                if (!categoryGroups[company]) {
                                    categoryGroups[company] = 0;
                                }
                                categoryGroups[company]++;
                                
                                // Also group by complaint type
                                const complaintType = item.complaintType || 'General Complaint';
                                const categoryKey = `${complaintType} (${company})`;
                                if (!categoryGroups[categoryKey]) {
                                    categoryGroups[categoryKey] = 0;
                                }
                                categoryGroups[categoryKey]++;
                            });
                            
                            treeData = {
                                category_with_count: categoryGroups,
                                registration_no_list: [...new Set(registration_no_list)]
                            };
                            
                            console.log('🎯 Semantic search results categorized:', treeData);
                        } else {
                            console.warn('Semantic search returned no results');
                            setEmptyResult(true);
                            return;
                        }
                    } catch (semanticError) {
                        console.error('Semantic search failed:', semanticError);
                        // Fall back to RCA API
                    }
                }
                
                // If no search query or semantic search failed, use CDIS RCA API
                if (!treeData || !treeData.category_with_count) {
                    console.log('📊 Using CDIS RCA API for category analysis...');
                    
                    const cdisResponse = await getCachedRCA({
                        ...params,
                        start_date: startDate,
                        end_date: endDate
                    });

                    if (cdisResponse && cdisResponse.words) {
                        console.log('CDIS RCA API Response:', cdisResponse);
                        
                        const tree = buildTreeFromCDIS(cdisResponse);
                        console.log('Built tree from CDIS:', tree);
                        
                        const transformedData = transformCDISData(tree);
                        console.log('Transformed CDIS data:', transformedData);
                        
                        treeData = transformedData;
                    }
                }
            }
            
            if (treeData === 'No More Level') {
                setData([]);
                alert('No more Levels');
                return;
            }
            
            // Check if API returned proper data structure
            if (!treeData || typeof treeData !== 'object') {
                console.error('Invalid API response structure:', treeData);
                setEmptyResult(true);
                return;
            }
            
            // Handle case where API returns success but no proper data
            if (treeData.success && !treeData.registration_no_list && !treeData.category_with_count) {
                console.warn('API returned success but no data found');
                setEmptyResult(true);
                return;
            }
            
            if (treeData.registration_no_list && treeData.registration_no_list !== 'NA') {
                setEmptyResult(treeData.registration_no_list.length == 0)

                setTransactionIds(treeData.registration_no_list);
                setCurrentBatchIndex(0);
                fetchBatch(treeData.registration_no_list.slice(0, batchSize));

                setBreadcrumbs([
                    ...breadcrumbs.slice(0, (params.level - 2)),
                    {
                        params,
                        ...treeData
                    }
                ])
            }
            
            // Handle category data
            if (treeData.category_with_count && typeof treeData.category_with_count === 'object') {
                console.log('Category data found:', treeData.category_with_count)
                const formattedData = Object.keys(treeData.category_with_count).map(key => ({
                    x: key,
                    y: treeData.category_with_count[key],
                }));

                console.log('Formatted chart data:', formattedData)
                setData([{ data: formattedData }]);
            } else {
                console.warn('No category_with_count data found in response');
                setData([]);
            }
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

            if (data && data.data) {
                setTableData(Object.values(data.data));
            } else {
                console.warn('No grievance data found in fetchBatch response:', data);
                setTableData([]);
            }
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const handleTileClick = (dataPointIndex) => {
        if (dataPointIndex === undefined || dataPointIndex < 0) return;
        const clickedCategory = data[0].data[dataPointIndex];
        const newParams = {
            ...parameters,
            ministry: clickedCategory.x,
            level: parseInt(parameters.level, 10) + 1,
        };
        setParameters(newParams);
        fetchData(newParams);
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

        setTransactionIds(previousBreadcrumb?.registration_no_list ?? ['NA'])

        setParameters({
            ...currentBreadcrumb?.params
        })

        setTimeout(() => {
            fetchData(currentBreadcrumb?.params)
        }, 200)
    }

    return (
        <div className="p-4">
            {/* <ParameterForm onSubmit={handleFormSubmit} /> */}
            <Filters filters={parameters} setFilters={handleFormSubmit} />

            {loading && <ProgressBar totalDuration={durationFactor} />}

            {/* {loading && <AILoader />} */}

            {emptyResult && !loading && <p className="text-red-900">No data found.</p>}

            {
                !loading && !emptyResult &&
                <>
                    {/* Show search info if semantic search was used */}
                    {parameters.searchQuery && (
                        <div className="semantic-search-info">
                            🧠 Semantic Search Results for: "<strong>{parameters.searchQuery}</strong>"
                        </div>
                    )}

                    <div className="semantic-chart-container semantic-treemap">
                        <Chart
                            series={data}
                            pushPath={handleTileClick}
                        />
                    </div>

                    {/* Only show breadcrumbs if we have meaningful navigation path, not just ministry */}
                    {breadcrumbs.length > 1 && (
                        <BreadCrumbs
                            list={breadcrumbs.map(({ params: { ministry } }) => ministry)}
                            setPathLength={updatePathLength}
                        />
                    )}

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


export default SemanticRCA;
