'use client';
import React from 'react';
import Link from 'next/link';
import { useData } from "@/components/DataContext";

export default function DashboardPage() {
  const { account, videos } = useData();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8 bg-[#fbfbfb]">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Performance</h3>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fa-solid fa-gauge-high text-green-500 text-sm"></i>
            </div>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl font-bold text-gray-800 tracking-tight">{account?.avgScore || 0}</span>
            <span className="text-sm text-gray-400 mb-1 font-medium">/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${account?.avgScore || 0}%` }}></div>
          </div>
        </div>
        
        {/* Engagement */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Engagement</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-magnifying-glass-chart text-blue-500 text-sm"></i>
            </div>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl font-bold text-gray-800 tracking-tight">{account?.avgEngagement || 0}</span>
            <span className="text-sm text-gray-400 mb-1 font-medium">%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${account?.avgEngagement || 0}%` }}></div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Action Items</h3>
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-yellow-500 text-sm"></i>
            </div>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl font-bold text-gray-800 tracking-tight">{account?.actionItems || 0}</span>
            <span className="text-sm text-gray-400 mb-1 font-medium">pending</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Recent Audit History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-semibold text-gray-800">Recent Audit History</h3>
          <Link href="/dashboard/audit" className="text-xs text-[#ef4444] hover:text-[#dc2626] font-medium bg-red-50 px-3 py-1.5 rounded-full transition-colors">View All Reports</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-xs uppercase tracking-wider">Date</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-xs uppercase tracking-wider">Video Title</th>
                <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-xs uppercase tracking-wider">Score</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 font-medium text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {videos.slice(0, 5).map((v) => {
                const sc = v.score || 0;
                const scClr = sc >= 70 ? 'text-green-700' : sc >= 50 ? 'text-yellow-700' : 'text-red-700';
                const scBg = sc >= 70 ? 'bg-green-100' : sc >= 50 ? 'bg-yellow-100' : 'bg-red-100';
                const statusClr = sc >= 70 ? 'text-green-600' : 'text-yellow-600';
                const statusBg = sc >= 70 ? 'bg-green-50' : 'bg-yellow-50';
                return (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/audit/${v.id}`}>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-500 text-xs whitespace-nowrap">{v.posted || 'Recent'}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 max-w-[140px] md:max-w-none truncate" style={{ direction: 'rtl' }}>{v.title || 'Video'}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4"><span className={`${scBg} ${scClr} px-2.5 py-1 rounded-md text-xs font-bold`}>{sc}</span></td>
                    <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4"><span className={`inline-flex items-center gap-1.5 ${statusClr} ${statusBg} px-2.5 py-1 rounded-full text-xs font-medium`}><i className="fa-solid fa-circle text-[8px]"></i> {sc >= 70 ? 'Done' : 'Review'}</span></td>
                    <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-right"><button className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-play px-2"></i></button></td>
                  </tr>
                );
              })}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No videos audited yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}