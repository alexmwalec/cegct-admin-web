import { BrowserRouter, Routes,Route} from 'react-router-dom';
import AnalyticsCharts from "../src/components/dashboard/AnalyticsCharts"
import LiveReportMap from "../src/components/dashboard/LiveReportMap"
import RecentReports from "../src/components/dashboard/RecentReports"
import ReportDetailModal from "../src/components/reports/ReportDetailModal"
import analytics from "../src/pages/analytics"
import dashboard from "../src/pages/dashboard"
import login from "../src/pages/login"
import officers from "../src/pages/officers"
import api from "../src/services/api"
import socket from "../src/services/socket"
import report from "../src/types/report"

function App(){
  return(
   <BrowserRouter>
   <Routes>
   
   <Route path="/" element={<login/>} ></Route>
   <Route path= "/dashboard" element={<dashboard/>} ></Route>
   <Route path= "/analytics" element={<analytics/>} ></Route>
   <Route path= "/officers" element={<officers/>} ></Route>
   <Route path= "/report/:id" element={<ReportDetailModal/>} ></Route>
   <Routes path= "/analytics/charts" element={<AnalyticsCharts/>} ></Routes>
   <Routes path= "/dashboard/map" element={<LiveReportMap/>} ></Routes>
   <Routes path= "/dashboard/recent" element={<RecentReports/>} ></Routes>
   <Routes path= "/report/:id" element={<ReportDetailModal/>} ></Routes>
   <Routes path= "/analytics/charts" element={<AnalyticsCharts/>} ></Routes>
   <Routes path= "/dashboard/map" element={<LiveReportMap/>} ></Routes>
   <Routes path= "/dashboard/recent" element={<RecentReports/>} ></Routes>
   <Routes path= "/report/:id" element={<ReportDetailModal/>} ></Routes>
   <Routes path= "/analytics/charts" element={<AnalyticsCharts/>} ></Routes>
   <Routes path= "/dashboard/map" element={<LiveReportMap/>} ></Routes>
   <Routes path= "/dashboard/recent" element={<RecentReports/>} ></Routes>
   <Routes path= "/report/:id" element={<ReportDetailModal/>} ></Routes>
   <Routes path= "/analytics/charts" element={<AnalyticsCharts/>} ></Routes>
   <Routes path= "/dashboard/map" element={<LiveReportMap/>} ></Routes>
   <Routes path= "/dashboard/recent" element={<RecentReports/>} ></Routes>
   <Routes path= "/report/:id" element={<ReportDetailModal/>} ></Routes>
   <Routes path= "/analytics/charts" element={<AnalyticsCharts/>} ></Routes>
   <Routes path= "/dashboard/map" element={<LiveReportMap/>} ></Routes>
   <Routes path= "/dashboard/recent" element={<RecentReports/>} ></Routes>
   <Routes path= "/report/:id" element={<ReportDetailModal/>} ></Routes>
   <Routes path= "/analytics/charts" element={<AnalyticsCharts/>} ></Routes>
   <Routes path= "/api" element={<api/>} ></Routes>  
   <Routes path= "/socket" element={<socket/>} ></Routes>
   
   </Routes>
   </BrowserRouter>
  )
}