import React from 'react';
import {
  Box, CircularProgress, Divider, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TableRow, Typography
} from '@mui/material'; 
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useAuthState from '../../hooks/useAuthState';
import useMonthlyExpenses from '../../hooks/useMonthlyExpenses';
import MainLayout from '../../components/MainLayout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { typeColors } from '../../constants/global';
import dayjs from 'dayjs';

const ExpensePage = () => {
  const { user } = useAuthState();
  const { monthlyData, loading } = useMonthlyExpenses(user?.uid);

  if (loading) {
    return (
      <MainLayout title='월별 비용'>
        <Box p={2} display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
          <Typography ml={2}>비용 데이터를 집계하는 중입니다...</Typography>
        </Box>
      </MainLayout>
    );
  }

  const categoryKeys = ['게임', '레슨', '정모', '대회', '용품'];
  let sortedCategories = [...categoryKeys];
  let totals = {};
  let grandTotal = 0;

  const processedData = Object.entries(monthlyData).map(([month, data]) => ({
    monthForDisplay: dayjs(month, 'YYYY년 M월').format('YYYY.MM'), // 표시용: "2025.09"
    monthForSort: dayjs(month, 'YYYY년 M월'),  // 정렬용: dayjs 객체
    ...data,
    total: categoryKeys.reduce((sum, key) => sum + (data[key] || 0), 0),
  }));

  const chartData = [...processedData].sort((a, b) => a.monthForSort.diff(b.monthForSort));
  const tableData = [...processedData].sort((a, b) => b.monthForSort.diff(a.monthForSort));

  if (chartData.length > 0) {
    // 항목별 누계 계산
    totals = categoryKeys.reduce((acc, key) => {
      acc[key] = chartData.reduce((sum, item) => sum + (item[key] || 0), 0);
      return acc;
    }, {});
    grandTotal = chartData.reduce((sum, item) => sum + (item.total || 0), 0);

    // 누계에 따라 내림차순으로 카테고리 정렬
    sortedCategories = categoryKeys.sort((a, b) => totals[b] - totals[a]);
  }

  const formatYAxis = (tickItem) => {
    if (tickItem >= 10000) {
      return `${tickItem / 10000}만`;
    }
    return tickItem;
  };
  const formatTooltip = (value) => `${value.toLocaleString()}원`;

  return (
    <MainLayout title='비용 관리'>
      <Box sx={{ p: 2, pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ReceiptLongIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            월별 비용
          </Typography>
        </Box>

        {chartData.length === 0 ? (
          <Typography color="text.secondary">
            표시할 비용 데이터가 없습니다.
          </Typography>
        ) : (
          <>
            {/* --- 그래프 영역 (정렬된 순서로 Bar 렌더링) --- */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* 🚀 dataKey를 표시용 month로 변경 */}
                <XAxis dataKey="monthForDisplay" fontSize={12} />
                <YAxis tickFormatter={formatYAxis} fontSize={12} />
                <Tooltip formatter={formatTooltip} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {sortedCategories.map(key => (
                  <Bar key={key} dataKey={key} stackId="a" fill={typeColors[key]} name={key} />
                ))}
              </BarChart>
            </ResponsiveContainer>

            {/* --- 표 영역 (정렬된 순서로 컬럼 및 데이터 렌더링) --- */}
            <Box mt={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">상세 내역</Typography>
                <Typography variant="body2" color="text.secondary">(단위: 원)</Typography>
              </Box>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 600 }} size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '13px' }}>월</TableCell>
                      {sortedCategories.map(key => (
                        <TableCell key={key} align="right" sx={{ fontWeight: 'bold', fontSize: '13px' }}>{key}</TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '13px' }}>월간 합계</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.monthForDisplay} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" sx={{ fontSize: '13px' }}>{row.monthForDisplay}</TableCell>
                        {sortedCategories.map(key => (
                          <TableCell key={key} align="right" sx={{ fontSize: '13px' }}>{(row[key] || 0).toLocaleString()}</TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontSize: '13px' }}>{row.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ backgroundColor: '#f0f0f0', '& > *': { fontWeight: 'bold', fontSize: '13px' } }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '13px' }}>누계</TableCell>
                      {/* 정렬된 카테고리 순서대로 누계 표시 */}
                      {sortedCategories.map(key => (
                        <TableCell key={key} align="right" sx={{ fontWeight: 'bold', fontSize: '13px' }}>{(totals[key] || 0).toLocaleString()}</TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '13px' }}>{grandTotal.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary">
          * 반복되는 레슨/정모 비용은 첫 달에만 한 번 반영됩니다.
        </Typography>

      </Box>
    </MainLayout>
  );
};

export default ExpensePage;