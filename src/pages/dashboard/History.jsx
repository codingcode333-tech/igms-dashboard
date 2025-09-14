import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Avatar,
  Chip,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { authorsTableData, projectsTableData } from "@/data";
import UserSearchHistory from "@/services/usersearchhistory";
import { useContext, useEffect, useState } from "react";
import { UserContext, getUser } from "@/context/UserContext";
import { setConfig } from "next/config";
import { downloadData } from "@/helpers/download";
import { setLoading, useMaterialTailwindController } from "@/context";
import { toast } from "react-toastify";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";

export function History() {

  const [historyData, setHistoryData] = useState(null);
  const typeList = ['Semantic', 'Keyword', 'Registration No', 'Name']
  const [count, setCount] = useState()
  const [total, setTotal] = useState()
  const [pageno, setPageno] = useState(1)
  const recordsPerPage = 20
  const from = pageno ? (((pageno - 1) * recordsPerPage) + 1) : 1
  const toRanged = pageno * recordsPerPage
  const to = pageno ? (toRanged < total ? toRanged : total) : 20
  const [, dispatch] = useMaterialTailwindController()

  const getHistory = async (id) => {

    const history = await UserSearchHistory.getSearch(pageno)

    const data = history.data['data'][0]
    await setHistoryData(Object.values(data));

    setCount(history.data['count'])
    setTotal(history.data['total_count'])
  }

  const formatDate = date => {
    if (date) {
      date = new Date(date).toLocaleDateString("en-IN")
      if (date != 'Invalid Date')
        return date
    }

    return ""
  }

  const downloadSearchResult = async idx => {
    setLoading(dispatch, true)
    let filename = (
      await UserSearchHistory.getDownloadPath(idx)
        .catch(error => {
          toast(error.message, {
            type: "error"
          })
        })
        .finally(() => setLoading(dispatch, false))
    )?.data?.filename

    if (filename)
      downloadData(filename, "logs/")
    else
      console.log("No file")
  }

  const deleteHistory = idx => {
    UserSearchHistory.deleteHistory(idx)
      .then(response => {
        if (response.data.status == "success") {
          toast("Deleted Successfully!", { type: "success" })

          getHistory()
        }
        else
          toast("Unable to Delete", { type: "error" })
      })
      .catch(({ message }) => toast(message, { type: "error" }))
  }

  useEffect(() => {
    getHistory()

    // Find the function with value 'value5' in the array
  }, [pageno]);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between">
          <div className="flex flex-col">
            <Typography variant="h6" color="white">
              Search History
            </Typography>
            <div>
              <div>
                {
                  count
                    ? total && pageno && total != count
                      ? `${from}-${to} / ${total} records`
                      : `${count} records`
                    : ''
                }
              </div>
            </div>
          </div>
          {
            pageno != null &&
            <div>
              <Button className="bg-white text-blue-800 mr-10 focus:opacity-100" disabled={pageno == 1} onClick={() => setPageno(pageno - 1)}>Prev</Button>
              <Button className="bg-white text-blue-800 focus:opacity-100" disabled={count < 20} onClick={() => setPageno(pageno + 1)}>Next</Button>
            </div>
          }
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px]  table-auto">
            <thead>
              <tr>
                {["Query", "From", "To", "State", "District", "Ministry", "Type", "Download"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyData?.map(
                (item, key) => {
                  const className = `py-3 px-5 ${key === historyData.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                    }`;

                  return (
                    <tr key={key}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500 font-bold">
                              {item.query}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {formatDate(item.startDate)}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {formatDate(item.endDate)}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {item.state}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {item.district}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {item.ministry}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>

                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {typeList[item.value - 1]}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Button onClick={() => downloadSearchResult(item.idx)}>Download</Button>

                          <XMarkIcon className="h-[1.2rem] cursor-pointer select-none" onClick={() => deleteHistory(item.idx)} />
                        </div>
                      </td>
                      {/* <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {job[0]}
                        </Typography>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {job[1]}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={online ? "green" : "blue-gray"}
                          value={online ? "online" : "offline"}
                          className="py-0.5 px-2 text-[11px] font-medium"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {date}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          as="a"
                          href="#"
                          className="text-xs font-semibold text-blue-gray-600"
                        >
                          Edit
                        </Typography>
                      </td> */}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
      {/* <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Projects Table
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["companies", "members", "budget", "completion", ""].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {projectsTableData.map(
                ({ img, name, members, budget, completion }, key) => {
                  const className = `py-3 px-5 ${
                    key === projectsTableData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={name}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar src={img} alt={name} size="sm" />
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {name}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        {members.map(({ img, name }, key) => (
                          <Tooltip key={name} content={name}>
                            <Avatar
                              src={img}
                              alt={name}
                              size="xs"
                              variant="circular"
                              className={`cursor-pointer border-2 border-white ${
                                key === 0 ? "" : "-ml-2.5"
                              }`}
                            />
                          </Tooltip>
                        ))}
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {budget}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="w-10/12">
                          <Typography
                            variant="small"
                            className="mb-1 block text-xs font-medium text-blue-gray-600"
                          >
                            {completion}%
                          </Typography>
                          <Progress
                            value={completion}
                            variant="gradient"
                            color={completion === 100 ? "green" : "blue"}
                            className="h-1"
                          />
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          as="a"
                          href="#"
                          className="text-xs font-semibold text-blue-gray-600"
                        >
                          <EllipsisVerticalIcon
                            strokeWidth={2}
                            className="h-5 w-5 text-inherit"
                          />
                        </Typography>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card> */}
    </div>
  );
}

export default History;
