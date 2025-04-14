import React, { useEffect, useState } from "react";
import { Table, Card, Typography, message, Space, Button, Input, Tag, Tooltip, Statistic, Row, Col, Select } from "antd";
import { ReloadOutlined, DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface AQIRecord {
    id: string;
    sensorId: string;
    aqiValue: number;
    recordedAt: string;
    location?: string;
}

const AllDataPage: React.FC = () => {
    const [data, setData] = useState<AQIRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [timeRange, setTimeRange] = useState('all');
    const [filteredData, setFilteredData] = useState<AQIRecord[]>([]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/airquality/history");
            // Format each entry (particularly the timestamp)
            const formattedData = response.data.map((item: any) => ({
                ...item,
                recordedAt: dayjs(item.recordedAt).format("YYYY-MM-DD HH:mm:ss")
            }));
            setData(formattedData);
            applyFilters(formattedData, searchText, timeRange);
            message.success("Data refreshed successfully");
        } catch (error) {
            message.error("Error fetching AQI historical data.");
            console.error("Fetch error:", error);
        }
        setLoading(false);
    };

    const applyFilters = (sourceData: AQIRecord[], search: string, range: string) => {
        let filtered = [...sourceData];

        // Apply search filter
        if (search) {
            filtered = filtered.filter(
                item =>
                    item.id.toString().includes(search) ||
                    item.sensorId.toString().includes(search) ||
                    (item.location && item.location.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Apply time range filter
        if (range !== 'all') {
            const now = dayjs();
            filtered = filtered.filter(item => {
                const recordDate = dayjs(item.recordedAt);
                switch(range) {
                    case 'today':
                        return recordDate.isAfter(now.startOf('day'));
                    case 'week':
                        return recordDate.isAfter(now.subtract(7, 'day'));
                    case 'month':
                        return recordDate.isAfter(now.subtract(1, 'month'));
                    default:
                        return true;
                }
            });
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        applyFilters(data, searchText, timeRange);
    }, [searchText, timeRange]);

    const getAQIStatusColor = (aqiValue: number) => {
        if (aqiValue <= 50) return "success";
        if (aqiValue <= 100) return "warning";
        if (aqiValue <= 150) return "orange";
        if (aqiValue <= 200) return "volcano";
        if (aqiValue <= 300) return "error";
        return "purple";
    };

    const getAQIStatusText = (aqiValue: number) => {
        if (aqiValue <= 50) return "Good";
        if (aqiValue <= 100) return "Moderate";
        if (aqiValue <= 150) return "Unhealthy for Sensitive Groups";
        if (aqiValue <= 200) return "Unhealthy";
        if (aqiValue <= 300) return "Very Unhealthy";
        return "Hazardous";
    };

    const handleExportCSV = () => {
        // Create CSV content
        const csvContent =
            "Reading ID,Sensor ID,AQI Value,Recorded At\n" +
            filteredData.map(item =>
                `${item.id},${item.sensorId},${item.aqiValue},"${item.recordedAt}"`
            ).join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `aqi-data-${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: "Reading ID",
            dataIndex: "id",
            key: "id",
            sorter: (a: AQIRecord, b: AQIRecord) => Number(a.id) - Number(b.id)
        },
        {
            title: "Sensor ID",
            dataIndex: "sensorId",
            key: "sensorId",
            sorter: (a: AQIRecord, b: AQIRecord) => a.sensorId.localeCompare(b.sensorId)
        },
        {
            title: "AQI Value",
            dataIndex: "aqiValue",
            key: "aqiValue",
            sorter: (a: AQIRecord, b: AQIRecord) => a.aqiValue - b.aqiValue,
            render: (value: number) => (
                <Tooltip title={getAQIStatusText(value)}>
                    <Tag color={getAQIStatusColor(value)} style={{ fontSize: '14px', padding: '2px 8px' }}>
                        {value}
                    </Tag>
                </Tooltip>
            )
        },
        {
            title: "Recorded At",
            dataIndex: "recordedAt",
            key: "recordedAt",
            sorter: (a: AQIRecord, b: AQIRecord) =>
                dayjs(a.recordedAt).valueOf() - dayjs(b.recordedAt).valueOf(),
            defaultSortOrder: "descend"
        }
    ];

    // Calculate summary stats
    const avgAQI = filteredData.length ?
        Math.round(filteredData.reduce((sum, item) => sum + item.aqiValue, 0) / filteredData.length) : 0;

    const maxAQI = filteredData.length ?
        Math.max(...filteredData.map(item => item.aqiValue)) : 0;

    return (
        <Card style={{ margin: "20px" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Title level={2}>AQI History Data</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={fetchAllData}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={handleExportCSV}
                                disabled={filteredData.length === 0}
                            >
                                Export CSV
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={8} md={6} lg={6}>
                        <Card size="small">
                            <Statistic
                                title="Total Records"
                                value={filteredData.length}
                                suffix={`/ ${data.length}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8} md={6} lg={6}>
                        <Card size="small">
                            <Statistic
                                title="Average AQI"
                                value={avgAQI}
                                valueStyle={{ color: getAQIStatusColor(avgAQI) === 'orange' ? '#fa8c16' : undefined }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8} md={6} lg={6}>
                        <Card size="small">
                            <Statistic
                                title="Max AQI"
                                value={maxAQI}
                                valueStyle={{ color: getAQIStatusColor(maxAQI) === 'orange' ? '#fa8c16' : undefined }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12} lg={8}>
                        <Search
                            placeholder="Search by ID or sensor"
                            allowClear
                            onSearch={value => setSearchText(value)}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select time range"
                            defaultValue="all"
                            onChange={value => setTimeRange(value)}
                        >
                            <Option value="all">All Time</Option>
                            <Option value="today">Today</Option>
                            <Option value="week">Past Week</Option>
                            <Option value="month">Past Month</Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    dataSource={filteredData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                    size="middle"
                    bordered
                    onChange={() => {}} // Necessary for sorters to work
                    scroll={{ x: 'max-content' }}
                />

                {filteredData.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary">No data found matching your criteria</Text>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default AllDataPage;