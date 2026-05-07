
import React from 'react';
import Link from 'next/link';

export default function DashboardHub() {
  return (
    <div className="min-h-screen w-full bg-[#e4dfd8] flex items-center justify-center p-8" style={{
      backgroundImage: "url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      
{/*  BEGIN: MainContainer  */}
<div className="bg-[#f2f2f2] w-full max-w-[1400px] h-[85vh] rounded-[32px] shadow-2xl flex overflow-hidden relative backdrop-blur-sm bg-opacity-95 text-[#2b2b2b] text-[14px]">
{/*  BEGIN: LeftSidebar  */}
<aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
<div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
<nav className="space-y-2 shrink-0">
<a className="flex items-center gap-3 px-4 py-2.5 text-[#2b2b2b] font-medium bg-white rounded-full transition-all shadow-sm border border-gray-100" href="#">
<i className="fa-solid fa-arrow-left text-[#ef4444]"></i>
            Back
          </a>
</nav>
<div className="space-y-6 mt-8 flex-1 overflow-y-auto pr-2">
{/*  Account Dropdown  */}
<div>
<h4 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider">Account</h4>
<div className="relative">
<select className="w-full bg-white border border-gray-200 text-gray-700 text-xs focus:ring-[#ef4444] focus:border-[#ef4444] block p-2.5 appearance-none cursor-pointer shadow-sm rounded-full px-4">
<option>Example Account</option>
<option>Personal Account</option>
<option>Business Account</option>
</select>
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
<i className="fa-solid fa-chevron-down text-[10px]"></i>
</div>
</div>
</div>
{/*  Platforms  */}
<div>
<h4 className="text-xs font-semibold text-gray-800 mb-3 mt-6 uppercase tracking-wider">Platforms</h4>
<ul className="space-y-2">
<li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white cursor-pointer transition-colors text-xs font-medium shadow-sm border border-gray-100 text-gray-900 rounded-full bg-white/60">
<i className="fa-brands fa-tiktok w-4 text-center"></i> TikTok
            </li>
<li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-medium">
<i className="fa-brands fa-youtube w-4 text-center text-red-500"></i> YouTube
            </li>
<li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-medium">
<i className="fa-brands fa-instagram w-4 text-center text-pink-600"></i> Instagram
            </li>
<li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-medium">
<i className="fa-brands fa-facebook w-4 text-center text-blue-600"></i> Facebook
            </li>
</ul>
</div>
</div>
</div>
<div className="pb-4 shrink-0 mt-4">
<button className="w-full bg-[#ef4444] text-white rounded-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium hover:bg-[#dc2626] transition-colors shadow-sm">
<i className="fa-solid fa-user-shield"></i>
          Team Login
        </button>
</div>
</aside>
{/*  END: LeftSidebar  */}
{/*  BEGIN: Main Dashboard Area  */}
<main className="flex-1 bg-[#fbfbfb] my-4 mr-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">
{/*  Top Bar / Sub-navigation  */}
<div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10 bg-white">
<div className="flex items-center gap-2">
<span className="text-[#ef4444] font-bold text-sm tracking-wider">MAS</span>
<span className="text-gray-500 font-medium text-sm">AI Studio Workspace</span>
<i className="fa-solid fa-chevron-right text-[10px] text-gray-400 mx-2"></i>
<span className="text-gray-800 font-semibold text-sm">Dashboard</span>
</div>
<div className="flex bg-gray-100 p-1 rounded-full text-xs font-medium"><button className="px-6 py-2 text-gray-500 hover:text-gray-700 rounded-full transition-all">Overview</button>
<button className="px-6 py-2 bg-white rounded-full shadow-sm text-gray-800 transition-all">Audit</button>
<button className="px-6 py-2 text-gray-500 hover:text-gray-700 rounded-full transition-all">Competitor Analysis</button>
<button className="px-6 py-2 text-gray-500 hover:text-gray-700 rounded-full transition-all">Idea Generation</button>
</div>
</div>
{/*  Dashboard Content  */}
<div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-[#fbfbfb]">
{/*  Top Cards  */}
<div className="grid grid-cols-3 gap-6">
{/*  Performance  */}
<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-200">
<div className="flex justify-between items-center">
<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Performance</h3>
<div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
<i className="fa-solid fa-gauge-high text-green-500 text-sm"></i>
</div>
</div>
<div className="flex items-end gap-2 mt-2">
<span className="text-4xl font-bold text-gray-800 tracking-tight">92</span>
<span className="text-sm text-gray-400 mb-1 font-medium">/100</span>
</div>
<div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
<div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
</div>
</div>
{/*  SEO Health  */}
<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-200">
<div className="flex justify-between items-center">
<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">SEO Health</h3>
<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
<i className="fa-solid fa-magnifying-glass-chart text-blue-500 text-sm"></i>
</div>
</div>
<div className="flex items-end gap-2 mt-2">
<span className="text-4xl font-bold text-gray-800 tracking-tight">88</span>
<span className="text-sm text-gray-400 mb-1 font-medium">/100</span>
</div>
<div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
<div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
</div>
</div>
{/*  Security  */}
<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-200">
<div className="flex justify-between items-center">
<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Security</h3>
<div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
<i className="fa-solid fa-shield-halved text-yellow-500 text-sm"></i>
</div>
</div>
<div className="flex items-end gap-2 mt-2">
<span className="text-4xl font-bold text-gray-800 tracking-tight">74</span>
<span className="text-sm text-gray-400 mb-1 font-medium">/100</span>
</div>
<div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
<div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '74%' }}></div>
</div>
</div>
</div>
{/*  Recent Audit History Table  */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
<div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
<h3 className="font-semibold text-gray-800">Recent Audit History</h3>
<button className="text-xs text-[#ef4444] hover:text-[#dc2626] font-medium bg-red-50 px-3 py-1.5 rounded-full transition-colors">View All Reports</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left text-sm">
<thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
<tr>
<th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">Date</th>
<th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">URL</th>
<th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">Score</th>
<th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">Status</th>
<th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-50 text-gray-700">
<tr className="hover:bg-gray-50/50 transition-colors group">
<td className="px-6 py-4 text-gray-500 text-xs">Oct 24, 2023</td>
<td className="px-6 py-4 font-medium text-gray-800">example.com/pricing</td>
<td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold">92</span></td>
<td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium"><i className="fa-solid fa-circle text-[8px]"></i> Completed</span></td>
<td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-ellipsis-vertical px-2"></i></button></td>
</tr>
<tr className="hover:bg-gray-50/50 transition-colors group">
<td className="px-6 py-4 text-gray-500 text-xs">Oct 22, 2023</td>
<td className="px-6 py-4 font-medium text-gray-800">example.com/about</td>
<td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">85</span></td>
<td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium"><i className="fa-solid fa-circle text-[8px]"></i> Completed</span></td>
<td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-ellipsis-vertical px-2"></i></button></td>
</tr>
<tr className="hover:bg-gray-50/50 transition-colors group">
<td className="px-6 py-4 text-gray-500 text-xs">Oct 15, 2023</td>
<td className="px-6 py-4 font-medium text-gray-800">example.com/blog</td>
<td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold">72</span></td>
<td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full text-xs font-medium"><i className="fa-solid fa-circle text-[8px]"></i> Issues Found</span></td>
<td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-ellipsis-vertical px-2"></i></button></td>
</tr>
<tr className="hover:bg-gray-50/50 transition-colors group">
<td className="px-6 py-4 text-gray-500 text-xs">Oct 10, 2023</td>
<td className="px-6 py-4 font-medium text-gray-800">example.com</td>
<td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold">88</span></td>
<td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium"><i className="fa-solid fa-circle text-[8px]"></i> Completed</span></td>
<td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-ellipsis-vertical px-2"></i></button></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</main>
{/*  END: Main Dashboard Area  */}
{/*  Assistant Avatar Floating Widget  */}
<div className="absolute bottom-8 right-8 flex items-end gap-3 z-20">
<div className="bg-black text-white text-xs px-4 py-2 rounded-2xl rounded-br-sm shadow-lg mb-4">
        Hi, How can i help<br />you today?
      </div>
<img alt="Robot Assistant" className="w-16 h-16 object-cover rounded-full drop-shadow-xl border-2 border-white bg-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC8o0Dh-48odiXykGf9dXZ3HQkqIfgf9DTRu5eek1doIbEYtT3mV9F81Cy0qYDCLwiee969EF8rp7BbSKDfanY00VuM7fdfaI5ep1w21ALHKbPuxkPnI6gSjMFcyH-A_4CAA37vlxHFk2pGPo5LeOezJJbSGhBXzZ8pz6cZQkiCn-j75BUoOxkfoudEM5roWGn3ZNugRg5ryjuqujKC1VbF1_LKy_SrkhUusodJAw_WiJctH9uPZBHfrOrf070sDEU62d6PK_FUA"/>
</div>
</div>
{/*  END: MainContainer  */}

    </div>
  );
}
