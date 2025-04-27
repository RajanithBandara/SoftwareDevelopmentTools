// frontend -- allData.tsx

import React, { useEffect, useState } from "react";
import {
    Paper, Typography, Button, TextField, Tooltip, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Grid, MenuItem, Select, InputLabel, FormControl, CircularProgress, Box,
    IconButton, Card, CardContent, Switch, FormControlLabel, Fade, Grow, Zoom
} from "@mui/material";
import {
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Search as SearchIcon,
    FilterAlt as FilterIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Visibility as VisibilityIcon,
    WbSunny as SunnyIcon,
    NightsStay as NightIcon
} from "@mui/icons-material";
import axios from "axios";
import dayjs from "dayjs";
import { motion } from "framer-motion";

// Add framer-motion wrapper for MUI components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

interface AQIRecord {
    id: string;
    sensorId: string;
    aqiValue: number;
    recordedAt: string;
    location?: string;
}

const AllDataPage: React.FC = () => {
    const [data, setData] = useState<AQIRecord[]>([]);
    const [filteredData, setFilteredData] = useState<AQIRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [timeRange, setTimeRange] = useState('all');
    const [page, setPage] = useState(1);
    const [darkMode, setDarkMode] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const rowsPerPage = 5;

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/airquality/history");
            const formattedData = response.data.map((item: any) => ({
                ...item,
                recordedAt: dayjs(item.recordedAt).format("YYYY-MM-DD HH:mm:ss")
            }));
            setData(formattedData);
            applyFilters(formattedData, searchText, timeRange);
        } catch (err) {
            console.error("Failed to fetch AQI data", err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (source: AQIRecord[], search: string, range: string) => {
        let filtered = [...source];
        if (search) {
            filtered = filtered.filter(item =>
                item.id.includes(search) ||
                item.sensorId.includes(search) ||
                (item.location && item.location.toLowerCase().includes(search.toLowerCase()))
            );
        }

        if (range !== 'all') {
            const now = dayjs();
            filtered = filtered.filter(item => {
                const recordDate = dayjs(item.recordedAt);
                switch (range) {
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
        setPage(1);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        applyFilters(data, searchText, timeRange);
    }, [searchText, timeRange]);

    // Theme palettes for dark and light modes
    const darkTheme = {
        bgPrimary: 'rgba(23, 15, 30, 0.95)',
        bgSecondary: 'rgba(40, 30, 60, 0.85)',
        bgTertiary: 'rgba(60, 45, 80, 0.75)',
        accentPrimary: '#9D4EDD',
        accentSecondary: '#C77DFF',
        accentTertiary: '#E0AAFF',
        textPrimary: '#FFFFFF',
        textSecondary: '#E0AAFF',
        textDim: 'rgba(224, 170, 255, 0.7)',
        goodGreen: '#00F5D4',
        moderateYellow: '#FFD166',
        unhealthyOrange: '#FF9E00',
        unhealthyRed: '#FF5C8D',
        veryUnhealthyPurple: '#BF00FF',
        hazardousRed: '#FF0A54',
        border: 'rgba(224, 170, 255, 0.2)',
        success: '#00F5D4',
        error: '#FF5C8D',
        cardGlow: '0 0 15px rgba(157, 78, 221, 0.3)',
        highlightGlow: '0 0 8px rgba(224, 170, 255, 0.5)',
    };

    const lightTheme = {
        bgPrimary: 'rgba(250, 250, 255, 0.95)',
        bgSecondary: 'rgba(242, 240, 250, 0.85)',
        bgTertiary: 'rgba(235, 232, 245, 0.75)',
        accentPrimary: '#7B2CBF',
        accentSecondary: '#9D4EDD',
        accentTertiary: '#C77DFF',
        textPrimary: '#1F1135',
        textSecondary: '#4A2B81',
        textDim: 'rgba(31, 17, 53, 0.6)',
        goodGreen: '#18A999',
        moderateYellow: '#D6A92B',
        unhealthyOrange: '#E67E00',
        unhealthyRed: '#DE3D73',
        veryUnhealthyPurple: '#9900CC',
        hazardousRed: '#D50046',
        border: 'rgba(123, 44, 191, 0.15)',
        success: '#18A999',
        error: '#DE3D73',
        cardGlow: '0 0 15px rgba(123, 44, 191, 0.1)',
        highlightGlow: '0 0 8px rgba(123, 44, 191, 0.25)',
    };

    // Select the current theme based on darkMode state
    const currentTheme = darkMode ? darkTheme : lightTheme;

    const getAQIColor = (value: number): string => {
        if (value <= 50) return currentTheme.goodGreen;
        if (value <= 100) return currentTheme.moderateYellow;
        if (value <= 150) return currentTheme.unhealthyOrange;
        if (value <= 200) return currentTheme.unhealthyRed;
        if (value <= 300) return currentTheme.veryUnhealthyPurple;
        return currentTheme.hazardousRed;
    };

    const getAQIText = (value: number) => {
        if (value <= 50) return "Good";
        if (value <= 100) return "Moderate";
        if (value <= 150) return "Unhealthy for Sensitive Groups";
        if (value <= 200) return "Unhealthy";
        if (value <= 300) return "Very Unhealthy";
        return "Hazardous";
    };

    const exportCSV = () => {
        const csv =
            "Reading ID,Sensor ID,AQI Value,Recorded At,Location\n" +
            filteredData.map(d =>
                `${d.id},${d.sensorId},${d.aqiValue},"${d.recordedAt}",${d.location || ''}`
            ).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `aqi-data-${dayjs().format("YYYY-MM-DD")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const avgAQI = filteredData.length ? Math.round(filteredData.reduce((sum, d) => sum + d.aqiValue, 0) / filteredData.length) : 0;
    const maxAQI = filteredData.length ? Math.max(...filteredData.map(d => d.aqiValue)) : 0;

    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Theme-aware UI styles
    const getThemeStyles = () => ({
        container: {
            p: 4,
            m: 2,
            borderRadius: '24px',
            backgroundColor: currentTheme.bgPrimary,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${currentTheme.border}`,
            color: currentTheme.textPrimary,
            transition: 'all 0.5s ease'
        },
        card: {
            borderRadius: '18px',
            backdropFilter: 'blur(8px)',
            backgroundColor: currentTheme.bgSecondary,
            boxShadow: currentTheme.cardGlow,
            border: `1px solid ${currentTheme.border}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
                boxShadow: currentTheme.highlightGlow,
                transform: animationsEnabled ? 'translateY(-5px)' : 'none'
            }
        },
        searchBar: {
            borderRadius: '50px',
            backgroundColor: currentTheme.bgSecondary,
            p: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${currentTheme.border}`,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease'
        },
        button: (variant: 'primary' | 'secondary' = 'primary') => ({
            borderRadius: '50px',
            textTransform: 'none',
            py: 1,
            px: 3,
            fontWeight: 600,
            backgroundColor: variant === 'primary' ? currentTheme.accentPrimary : 'transparent',
            color: variant === 'primary' ? '#FFFFFF' : currentTheme.accentPrimary,
            border: variant === 'primary' ? 'none' : `1px solid ${currentTheme.accentPrimary}`,
            boxShadow: variant === 'primary' ? currentTheme.cardGlow : 'none',
            transition: 'all 0.3s ease',
            backdropFilter: variant === 'secondary' ? 'blur(8px)' : 'none',
            '&:hover': {
                backgroundColor: variant === 'primary' ? currentTheme.accentSecondary : `${currentTheme.accentPrimary}15`,
                transform: animationsEnabled ? 'scale(1.02)' : 'none'
            }
        }),
        titleText: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
            background: `linear-gradient(45deg, ${currentTheme.accentPrimary}, ${currentTheme.accentSecondary})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transition: 'all 0.5s ease'
        },
        metricCard: {
            borderRadius: '18px',
            p: 2.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: currentTheme.bgSecondary,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${currentTheme.border}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at center, ${currentTheme.accentSecondary}15 0%, rgba(0, 0, 0, 0) 70%)`,
                zIndex: 0
            }
        },
        metricValue: {
            fontWeight: 700,
            fontSize: '2rem',
            mt: 1,
            position: 'relative',
            zIndex: 1,
            color: currentTheme.textPrimary,
            transition: 'all 0.3s ease'
        },
        metricLabel: {
            color: currentTheme.textDim,
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease'
        },
        tableContainer: {
            borderRadius: '18px',
            overflow: 'hidden',
            backgroundColor: 'transparent',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${currentTheme.border}`,
            boxShadow: currentTheme.cardGlow,
            transition: 'all 0.5s ease'
        },
        tableHead: {
            '& .MuiTableCell-root': {
                backgroundColor: currentTheme.bgTertiary,
                color: currentTheme.textPrimary,
                fontWeight: 600,
                borderBottom: `1px solid ${currentTheme.border}`,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.5s ease'
            }
        },
        tableRow: (index: number) => ({
            backgroundColor: index % 2 === 0
                ? `${currentTheme.bgTertiary}`
                : `${currentTheme.bgSecondary}`,
            borderBottom: `1px solid ${currentTheme.border}`,
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: `${currentTheme.accentSecondary}15`,
                boxShadow: `inset 0 0 15px ${currentTheme.accentSecondary}10`
            }
        }),
        tableCell: {
            borderBottom: 'none',
            color: currentTheme.textPrimary,
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
        },
        aqiChip: (value: number) => ({
            borderRadius: '12px',
            fontWeight: 600,
            color: darkMode ? '#000000' : '#FFFFFF',
            backgroundColor: getAQIColor(value),
            minWidth: '70px',
            textAlign: 'center',
            boxShadow: `0 0 10px ${getAQIColor(value)}80`,
            border: `1px solid ${getAQIColor(value)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: animationsEnabled ? 'scale(1.05)' : 'none',
                boxShadow: `0 0 15px ${getAQIColor(value)}`
            }
        }),
        paginationButton: {
            color: currentTheme.accentTertiary,
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: `${currentTheme.accentSecondary}20`,
                transform: animationsEnabled ? 'scale(1.1)' : 'none'
            },
            '&.Mui-disabled': {
                color: `${currentTheme.textDim}70`
            }
        },
        iconButton: {
            color: currentTheme.accentTertiary,
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: `${currentTheme.accentSecondary}20`,
                transform: animationsEnabled ? 'rotate(15deg)' : 'none'
            }
        },
        switch: {
            '& .MuiSwitch-switchBase.Mui-checked': {
                color: currentTheme.accentSecondary
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: currentTheme.accentPrimary
            }
        },
        noDataMessage: {
            color: currentTheme.textDim,
            fontStyle: 'italic',
            textAlign: 'center',
            py: 3,
            transition: 'all 0.3s ease'
        },
        pagination: {
            color: currentTheme.textSecondary,
            '& .MuiPaginationItem-root': {
                color: currentTheme.textPrimary
            },
            transition: 'all 0.3s ease'
        },
        themeIconContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            position: 'relative',
            transition: 'all 0.3s ease'
        },
        themeIcon: {
            position: 'absolute',
            color: currentTheme.accentTertiary,
            opacity: 1,
            transform: 'scale(1)',
            transition: 'all 0.4s ease'
        },
        hiddenThemeIcon: {
            opacity: 0,
            transform: 'scale(0.5)',
            transition: 'all 0.3s ease'
        }
    });

    const glassyStyles = getThemeStyles();

    // Animation variants for framer-motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        })
    };

    // Handle theme switch animation
    const handleThemeToggle = () => {
        setDarkMode(!darkMode);
    };

    return (
        <Paper sx={glassyStyles.container}>
            <MotionBox
                initial={animationsEnabled ? "hidden" : "visible"}
                animate="visible"
                variants={containerVariants}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <MotionBox variants={itemVariants}>
                        <Typography variant="h4" sx={glassyStyles.titleText}>
                            Air Quality Index History
                        </Typography>
                    </MotionBox>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={animationsEnabled}
                                    onChange={(e) => setAnimationsEnabled(e.target.checked)}
                                    sx={glassyStyles.switch}
                                    size="small"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: currentTheme.textDim }} />
                                    <Typography variant="body2" sx={{ color: currentTheme.textDim }}>Animations</Typography>
                                </Box>
                            }
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={darkMode}
                                    onChange={handleThemeToggle}
                                    sx={glassyStyles.switch}
                                    size="small"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={glassyStyles.themeIconContainer}>
                                        <NightIcon
                                            fontSize="small"
                                            sx={{
                                                ...glassyStyles.themeIcon,
                                                ...(darkMode ? {} : glassyStyles.hiddenThemeIcon)
                                            }}
                                        />
                                        <SunnyIcon
                                            fontSize="small"
                                            sx={{
                                                ...glassyStyles.themeIcon,
                                                ...(darkMode ? glassyStyles.hiddenThemeIcon : {})
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 0.5, color: currentTheme.textDim }}>
                                        {darkMode ? "Dark" : "Light"}
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>
                </Box>

                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={8}>
                        <MotionBox variants={itemVariants}>
                            <Box sx={glassyStyles.searchBar}>
                                <SearchIcon sx={{ color: currentTheme.accentTertiary, mr: 1 }} />
                                <TextField
                                    fullWidth
                                    placeholder="Search by ID, sensor, or location"
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    variant="standard"
                                    InputProps={{
                                        disableUnderline: true,
                                        style: { color: currentTheme.textPrimary }
                                    }}
                                    sx={{
                                        bgcolor: 'transparent',
                                        '& .MuiInputBase-input::placeholder': {
                                            color: currentTheme.textDim,
                                            opacity: 1
                                        }
                                    }}
                                />
                                <Tooltip title="Filter Options">
                                    <IconButton size="small" sx={glassyStyles.iconButton}>
                                        <FilterIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </MotionBox>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <MotionBox variants={itemVariants}>
                            <FormControl fullWidth sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '50px',
                                    backgroundColor: currentTheme.bgSecondary,
                                    border: `1px solid ${currentTheme.border}`,
                                    color: currentTheme.textPrimary,
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.3s ease'
                                },
                                '& .MuiInputLabel-root': {
                                    color: currentTheme.textDim,
                                    marginLeft: '10px',
                                    transition: 'all 0.3s ease'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                '& .MuiSelect-icon': {
                                    color: currentTheme.accentTertiary,
                                    transition: 'all 0.3s ease'
                                }
                            }}>
                                <InputLabel>Time Range</InputLabel>
                                <Select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    label="Time Range"
                                >
                                    <MenuItem value="all">All Time</MenuItem>
                                    <MenuItem value="today">Today</MenuItem>
                                    <MenuItem value="week">Past Week</MenuItem>
                                    <MenuItem value="month">Past Month</MenuItem>
                                </Select>
                            </FormControl>
                        </MotionBox>
                    </Grid>
                </Grid>

                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={4}>
                        <MotionBox variants={itemVariants}>
                            <MotionCard
                                sx={glassyStyles.metricCard}
                                whileHover={animationsEnabled ? { y: -5 } : {}}
                            >
                                <Typography variant="subtitle2" sx={glassyStyles.metricLabel}>
                                    Total Records
                                </Typography>
                                <Typography sx={glassyStyles.metricValue}>
                                    {filteredData.length} <Typography component="span" variant="body2" sx={{ color: currentTheme.textDim }}>/ {data.length}</Typography>
                                </Typography>
                            </MotionCard>
                        </MotionBox>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <MotionBox variants={itemVariants}>
                            <MotionCard
                                sx={glassyStyles.metricCard}
                                whileHover={animationsEnabled ? { y: -5 } : {}}
                            >
                                <Typography variant="subtitle2" sx={glassyStyles.metricLabel}>
                                    Average AQI
                                </Typography>
                                <Typography sx={glassyStyles.metricValue}>
                                    {avgAQI}
                                </Typography>
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '4px',
                                    background: `linear-gradient(to right, ${getAQIColor(avgAQI)}, transparent)`,
                                    transition: 'all 0.3s ease'
                                }} />
                            </MotionCard>
                        </MotionBox>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <MotionBox variants={itemVariants}>
                            <MotionCard
                                sx={glassyStyles.metricCard}
                                whileHover={animationsEnabled ? { y: -5 } : {}}
                            >
                                <Typography variant="subtitle2" sx={glassyStyles.metricLabel}>
                                    Max AQI
                                </Typography>
                                <Typography sx={glassyStyles.metricValue}>
                                    {maxAQI}
                                </Typography>
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '4px',
                                    background: `linear-gradient(to right, ${getAQIColor(maxAQI)}, transparent)`,
                                    transition: 'all 0.3s ease'
                                }} />
                            </MotionCard>
                        </MotionBox>
                    </Grid>
                </Grid>

                <MotionBox variants={itemVariants} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
                    <Tooltip title="Refresh Data">
                        <Button
                            startIcon={<RefreshIcon />}
                            variant="contained"
                            onClick={fetchAllData}
                            disabled={loading}
                            sx={glassyStyles.button('primary')}
                        >
                            Refresh
                        </Button>
                    </Tooltip>

                    <Tooltip title="Download as CSV">
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={exportCSV}
                            disabled={!filteredData.length}
                            sx={glassyStyles.button('secondary')}
                        >
                            Export CSV
                        </Button>
                    </Tooltip>
                </MotionBox>

                {loading ? (
                    <MotionBox
                        variants={itemVariants}
                        sx={{ textAlign: 'center', my: 4 }}
                    >
                        <CircularProgress sx={{ color: currentTheme.accentSecondary }} />
                    </MotionBox>
                ) : (
                    <>
                        <MotionBox variants={itemVariants}>
                            <TableContainer sx={glassyStyles.tableContainer}>
                                <Table stickyHeader>
                                    <TableHead sx={glassyStyles.tableHead}>
                                        <TableRow>
                                            <TableCell>Reading ID</TableCell>
                                            <TableCell>Sensor ID</TableCell>
                                            <TableCell align="center">AQI Value</TableCell>
                                            <TableCell>Recorded At</TableCell>
                                            <TableCell>Location</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedData.map((row, index) => (
                                            <MotionTableRow
                                                key={row.id}
                                                sx={glassyStyles.tableRow(index)}
                                                custom={index}
                                                initial={animationsEnabled ? "hidden" : "visible"}
                                                animate="visible"
                                                variants={tableRowVariants}
                                            >
                                                <TableCell sx={glassyStyles.tableCell}>{row.id}</TableCell>
                                                <TableCell sx={glassyStyles.tableCell}>{row.sensorId}</TableCell>
                                                <TableCell align="center" sx={glassyStyles.tableCell}>
                                                    <Tooltip title={getAQIText(row.aqiValue)} arrow placement="top">
                                                        <MotionBox
                                                            component="div"
                                                            sx={{
                                                                display: 'inline-block',
                                                                px: 2,
                                                                py: 0.75,
                                                                ...glassyStyles.aqiChip(row.aqiValue)
                                                            }}
                                                            whileHover={animationsEnabled ? { scale: 1.1 } : {}}
                                                        >
                                                            {row.aqiValue}
                                                        </MotionBox>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={glassyStyles.tableCell}>{row.recordedAt}</TableCell>
                                                <TableCell sx={glassyStyles.tableCell}>{row.location || '-'}</TableCell>
                                            </MotionTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {filteredData.length === 0 && (
                                    <Fade in={true}>
                                        <Box sx={glassyStyles.noDataMessage}>
                                            <Typography variant="body2">
                                                No data found matching your criteria.
                                            </Typography>
                                        </Box>
                                    </Fade>
                                )}
                            </TableContainer>
                        </MotionBox>

                        <MotionBox
                            variants={itemVariants}
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}
                        >
                            <Tooltip title="Previous Page">
                                <span>
                                    <IconButton
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        sx={glassyStyles.paginationButton}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Typography variant="body2" sx={{ mx: 3, color: currentTheme.textSecondary }}>
                                Page {page} of {Math.max(1, Math.ceil(filteredData.length / rowsPerPage))}
                            </Typography>

                            <Tooltip title="Next Page">
                                <span>
                                    <IconButton
                                        disabled={page >= Math.ceil(filteredData.length / rowsPerPage)}
                                        onClick={() => setPage(p => Math.min(Math.ceil(filteredData.length / rowsPerPage), p + 1))}
                                        sx={glassyStyles.paginationButton}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </MotionBox>
                    </>
                )}
            </MotionBox>

            {/* Theme transition overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    backgroundColor: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                    opacity: 0,
                    transition: 'opacity 0.5s ease',
                    zIndex: 9999,
                    '&.transitioning': {
                        opacity: 1
                    }
                }}
                className={animationsEnabled ? "theme-transition" : ""}
            />
        </Paper>
    );
};


const style = document.createElement('style');
style.textContent = `
  .theme-transition {
    animation: theme-flash 0.5s ease;
  }
  
  @keyframes theme-flash {
    0% { opacity: 0; }
    50% { opacity: 0.3; }
    100% { opacity: 0; }
  }
`;
document.head.appendChild(style);

export default AllDataPage;