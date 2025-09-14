import React, { useState } from "react";
// import TreeMap from "react-d3-treemap";
// import "react-d3-treemap/dist/react.d3.treemap.css";
import { data } from "./data.js";
import { data1 } from "./outputjs.js";
import {
  Typography,
  Select,
  Option,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
} from "@material-tailwind/react";
import { ExclamationCircleIcon, StarIcon, BookmarkSquareIcon, DocumentTextIcon, HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/outline";

import { authorsTableData, projectsTableData, departmentData, grievanceTableData, getDepartmentList } from "@/data";
import GrievancesRoutes from "@/services/grievances";

export function RCA() {
  const [selectedOption, setSelectedOption] = useState('');

  const [modelLoader, setModalLoading] = useState(false);
  const [grievancesDesc, setGrievancesDesc] = useState(null);


  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleOpenModal = async (G_id) => {

    setModalIsOpen(true);
    setModalLoading(true);
    const descGrievances = await GrievancesRoutes.descGrievance(G_id)
    setGrievancesDesc(descGrievances.data)
    console.log(grievancesDesc)
    setModalLoading(false)
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };




  const handleNodeClick = (nodeData) => {
    alert("hii")
    console.log(nodeData);
  };



  return (
    <>

      <div className="mt-3 w-1/3 mb-2 flex-col  items-center gap-2">
        <Select
          className=""
          label="Select Ministry"
        >

          {getDepartmentList().map((item) => {
            return (

              <Option value={item.value}>{item.label}</Option>


            )

          })
          }


        </Select>

      </div>

      <div className="flex">


        <div className="App">
          {/* <TreeMap
            height={800}
            width={1200}
            data={data}
            onNodeClick={handleNodeClick}
            collapsible={false}
            
          /> */}
        </div>
        <div className="mt-[50px] right-0 ">

          <Card>
            <CardHeader variant="gradient" color="blue" className="mb-8   p-6">
              <Typography variant="h6" color="white"  >
                Grievances
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[290px]  table-auto">
                <thead>

                </thead>
                <tbody>
                  {grievanceTableData.map(
                    ({ Registration_No }, key) => {
                      const className = `py-3 px-5 ${key === authorsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr >
                          <td className={className} onClick={() => handleOpenModal(Registration_No)}>
                            <div className="flex items-center gap-4">
                              <div>

                                <Typography className="text-xs font-normal text-blue-gray-500 hover:cursor-pointer">
                                  {Registration_No}
                                </Typography>
                              </div>
                            </div>
                          </td>



                        </tr>
                      );
                    }
                  )}
                  {grievanceTableData.map(
                    ({ Registration_No }, key) => {
                      const className = `py-3 px-5 ${key === authorsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr >
                          <td className={className} onClick={() => handleOpenModal(Registration_No)}>
                            <div className="flex items-center gap-4">
                              <div>

                                <Typography className="text-xs font-normal text-blue-gray-500 hover:cursor-pointer">
                                  {Registration_No}
                                </Typography>
                              </div>
                            </div>
                          </td>



                        </tr>
                      );
                    }
                  )}
                  {grievanceTableData.map(
                    ({ Registration_No }, key) => {
                      const className = `py-3 px-5 ${key === authorsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr >
                          <td className={className} onClick={() => handleOpenModal(Registration_No)}>
                            <div className="flex items-center gap-4">
                              <div>

                                <Typography className="text-xs font-normal text-blue-gray-500 hover:cursor-pointer">
                                  {Registration_No}
                                </Typography>
                              </div>
                            </div>
                          </td>



                        </tr>
                      );
                    }
                  )}

                </tbody>
              </table>
            </CardBody>
          </Card>

          {modalIsOpen && (




            <div className="fixed  inset-0 flex items-center justify-center z-50">
              <div className="fixed inset-0 bg-black opacity-50"></div>

              <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">

                {modelLoader ? (<>

                  <div>Loading ......</div>

                </>) : (<>



                  <div className="bg-white w-full md:w-10/12 h-full pt-2  p-8 rounded-lg shadow-lg relative">
                    {/* Close button */}


                    <div className="h-auto w-full justify-center flex  ">


                      <div className="w-1/2 ">
                        <div className="flex">
                          <p className="text-[15px] lg:text-[20px] mr-10"> Registration Number: DOPPW/P/2023/0007143 </p>

                        </div>
                        <p><strong>By : &nbsp;</strong>Madhav Maheshwari &nbsp; <strong>Date : &nbsp;</strong>25/07/2023</p>
                        <p><strong>Email : &nbsp;</strong>madhavm22@gmail.com &nbsp; <strong>Phone No : &nbsp;</strong>9876543210</p>
                      </div>
                      <div className="w-1/2">
                        <div className=" flex gap-2 ">
                          <Select
                            className=""
                            label="Select Ministry"
                          >

                            {departmentData.map((item) => {
                              return (

                                <Option value={item.value}>{item.label}</Option>


                              )

                            })
                            }


                          </Select>

                          <Input className="mr-10" type="text" label="Add a label" />

                        </div>
                        <div className="w-full flex justify-end">
                          <button class="relative group ">

                            <ExclamationCircleIcon class="h-8 w-20 text-red-500" />


                            <div class="absolute  flex flex-col w-full items-center hidden mb-6 group-hover:flex">

                              <span class="relative z-10 p-2  text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">Marked as Spam</span>
                            </div>
                          </button>
                          <button class="relative group ">
                            <StarIcon class="h-8 w-20 text-yellow-500" />

                            <div class="absolute  flex flex-col w-full items-center hidden mb-6 group-hover:flex">

                              <span class="relative z-10 p-2  text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">Marked as Starred</span>
                            </div>
                          </button>
                          <button class="relative group ">
                            <BookmarkSquareIcon class="h-8 w-20 " />
                            <div class="absolute  flex flex-col w-full items-center hidden mb-6 group-hover:flex">

                              <span class="relative z-10 p-2  text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">Marked as Priority</span>
                            </div>
                          </button>
                          <button class="relative group ">
                            <DocumentTextIcon class="h-8 w-20 text-red-500" />

                          </button>

                        </div>
                      </div>
                    </div>


                    <hr></hr>

                    {/* {
"IsGrievanceDocumentAvailable": "Yes",
"ClosureRemarks": "FILED",
"IsClosureDocumentAvailable": "No",
"CanAppeal": "N",
}, */}

                    <div className=" h-auto mt-2 mb-2 justify-center flex">


                      <div className="w-1/2">
                        <p><strong>Address : &nbsp;</strong>Village Palsoda Post Palsoda UJJAIN </p>
                        <p><strong>State : &nbsp;</strong>Madhya Pradesh &nbsp; <strong>District : &nbsp;</strong>9876543210</p>
                        <p><strong>Pincode : &nbsp;</strong>456001 </p>
                        <p><strong>First Received By : &nbsp;</strong>President's Secretariat &nbsp; <strong>Closed By : &nbsp;</strong>President's Secretariat</p>
                        <p><strong>Closure Date : &nbsp;</strong>25/07/2023</p>

                        <p><strong>Closure Remarks : &nbsp;</strong>madhavm22@gmail.com</p>




                      </div>
                      <div className="w-1/2">
                        <div className="flex justify-end  ">
                          <div class="bg-gray-200 inline-flex items-center  text-sm rounded  mr-1">
                            <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> DARPG</span>
                            <button class="w-6 h-6 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                              <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                            </button>
                          </div>
                          <div class="bg-gray-200 inline-flex items-center text-sm rounded  mr-1">
                            <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> DARPG</span>
                            <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                              <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                            </button>
                          </div>
                          <div class="bg-gray-200 inline-flex items-center text-sm rounded  mr-1">
                            <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> DARPG</span>
                            <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                              <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                            </button>
                          </div>
                          <div class="bg-gray-200 inline-flex items-center text-sm rounded  mr-1">
                            <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> DARPG</span>
                            <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                              <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                    <hr></hr>
                    <br></br>
                    <div className="w-full h-auto mb-4 flex items-center justify-center">
                      <div class="bg-gray-200 inline-flex items-center text-sm rounded  mr-1">
                        <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> Passport related issues</span>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <HandThumbUpIcon class="h-4 w-4 text-gray-500" />
                        </button>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <HandThumbDownIcon class="h-4 w-4 text-gray-500" />
                        </button>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                        </button>
                      </div>
                      <div class="bg-gray-200 inline-flex items-center text-sm rounded  mr-1">
                        <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> Passport related issues</span>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <HandThumbUpIcon class="h-4 w-4 text-gray-500" />
                        </button>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <HandThumbDownIcon class="h-4 w-4 text-gray-500" />
                        </button>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                        </button>
                      </div><div class="bg-gray-200 inline-flex items-center text-sm rounded  mr-1">
                        <span class="ml-2 mr-1 leading-relaxed truncate max-w-xs" x-text="tag"> Passport related issues</span>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <HandThumbUpIcon class="h-4 w-4 text-gray-500" />
                        </button>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <HandThumbDownIcon class="h-4 w-4 text-gray-500" />
                        </button>
                        <button class="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none">
                          <svg class="w-6 h-6 fill-current mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z" /></svg>
                        </button>
                      </div>


                    </div>
                    <div className="mb-10 h-[720px] overflow-y-auto bg-gray-200 p-4  rounded-lg  ">
                      <p class="text-base leading-8 ">
                        {/* Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. */}
                        {grievancesDesc?.subject_content}
                      </p>

                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-800"
                    >
                      <svg
                        className="w-6 h-6 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M6.293 6.293a1 1 0 011.414 0L12 10.586l4.293-4.293a1 1 0 111.414 1.414L13.414 12l4.293 4.293a1 1 0 01-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 12 6.293 7.707a1 1 0 010-1.414z" />
                      </svg>
                    </button>

                    {/* Modal content */}
                    {/* {children} */}
                  </div>


                </>)}

              </div >
            </div>
          )
          }

        </div>
      </div>
    </>
  );
}

export default RCA;
