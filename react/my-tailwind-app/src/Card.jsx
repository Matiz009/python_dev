import React from 'react'

const Card = ({id,title,body,userId}) => {
  return (
    <div><div
   className="bg-white border border-slate-200 shadow-sm w-full max-w-sm rounded-lg mx-auto mt-6 p-4 sm:p-6 dark:bg-neutral-800 dark:border-neutral-700">
   {id}
   <div>
      <h3 className="text-slate-900 text-base font-semibold dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">{body}</p>
   </div>
   <a href="#"
      className="inline-block mt-6 py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      {userId}
   </a>
</div>
    </div>
  )
}

export default Card