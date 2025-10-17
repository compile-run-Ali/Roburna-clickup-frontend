import React from 'react'
import Link from 'next/link'
const Sidebar = () => {
  return (
    <div>

{/* <link rel="stylesheet" href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" /> */}

{/* <div className="min-h-screen flex flex-row bg-gray-100"> */}
  <div className="flex flex-col w-56 bg-green-800 overflow-hidden h-screen">
  
    <div className="flex items-center justify-center h-20 shadow-md">
      <h1 className="text-3xl uppercase text-white">Roburna</h1>
    </div>
    <div className='justify-evenly'>
    <ul className="flex flex-col py-4">
      <li>
        <Link href="/" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-home"></i></span>
          <span className="text-sm font-medium text-white">Home</span>
        </Link>
      </li>
      <li>
        <Link href="/task-board" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-task"></i></span>
          <span className="text-sm font-medium text-white">My Task Board</span>
        </Link>
      </li>
      <li>
        <Link href="/project-management" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-drink"></i></span>
          <span className="text-sm font-medium text-white">Projects Managment</span>
        </Link>
      </li>
      <li>
        <Link href="/feedback" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-comment"></i></span>
          <span className="text-sm font-medium text-white">Feedback Queue</span>
                    <span className="ml-auto mr-6 text-sm bg-red-100 rounded-full px-3 py-px text-red-500">5</span>

        </Link>
      </li>
      <li>
        <Link href="/client-management" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-user"></i></span>
          <span className="text-sm font-medium text-white">Client Managment</span>
        </Link>
      </li>
      <li>
        <Link href="/performance" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-performance"></i></span>
          <span className="text-sm font-medium text-white">Performance</span>
        </Link>
      </li>
      <li>
        <Link href="/archive" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-bell"></i></span>
          <span className="text-sm font-medium text-white">Archive</span>
        </Link>
      </li>
      <li>
        <a href="#" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
          <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><i className="bx bx-log-out"></i></span>
          <span className="text-sm font-medium text-white">Logout</span>
        </a>
      </li>
    </ul>
  </div>
  </div>
</div>
    // </div>
  )
}

export default Sidebar