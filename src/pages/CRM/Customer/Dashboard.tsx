import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
} from 'echarts/components';
import {
    MdPendingActions,
    MdReceiptLong,
    MdRequestPage,
} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';

export default function Dashboard() {
    const {
        items,
        summary,
        loading,
        chartPendingApproval,
        poStatusChart,
        subsidiaryChart,
    } = usePurchaseOrderDashboard();
    return (<></>)
}