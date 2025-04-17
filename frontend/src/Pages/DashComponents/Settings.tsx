import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Switch, FormControlLabel, IconButton,
    Card, CardContent, Typography, Chip, Tooltip, Badge, Divider,
    Box, Paper, Grid, FormControl, InputLabel, Stack,
    Snackbar, Alert, DialogContentText
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationOnIcon,
    Explore as ExploreIcon,
    Dashboard as DashboardIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Check as CheckIcon
} from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";

interface Sensor {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    status: boolean;
}

// Material UI theme colors
const colors = {
    primary: "#2196f3",       // Material Blue
    secondary: "#4caf50",     // Material Green
    danger: "#f44336",        // Material Red
    warning: "#ff9800",       // Material Orange
    background: "#ffffff",    // Light background
    cardBg: "#f5f5f5",        // Light card background
    borderColor: "#e0e0e0",   // Light subtle border
    headerBg: "#eeeeee",      // Light header background
    hoverBg: "#e0e0e0",       // Light hover state
    textPrimary: "#212121",   // Main text color
    textSecondary: "#757575", // Secondary text
    textTertiary: "#9e9e9e",  // Tertiary text
    divider: "#bdbdbd",       // Divider lines
    inputBg: "#ffffff",       // Input fields
    modalBg: "#ffffff",       // Modal background
};

const SensorManagement: React.FC = () => {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [deletingSensorId, setDeletingSensorId] = useState<number | null>(null);
    const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
    const [formValues, setFormValues] = useState<Partial<Sensor>>({
        location: "",
        latitude: 0,
        longitude: 0,
        status: true
    });
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [totalActive, setTotalActive] = useState<number>(0);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: "success" | "error"}>({
        open: false,
        message: "",
        severity: "success"
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);

    // Fetch sensor list
    const fetchSensors = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/settings/sensors");
            setSensors(response.data);
            setTotalActive(response.data.filter((sensor: Sensor) => sensor.status).length);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to fetch sensors.",
                severity: "error"
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    // Open modal for adding a new sensor
    const openAddModal = () => {
        setEditingSensor(null);
        setFormValues({
            location: "",
            latitude: 0,
            longitude: 0,
            status: true
        });
        setModalVisible(true);
    };

    // Open modal for editing an existing sensor
    const openEditModal = (sensor: Sensor) => {
        setEditingSensor(sensor);
        setFormValues(sensor);
        setModalVisible(true);
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save sensor (add or update)
    const handleSave = async () => {
        try {
            if (editingSensor) {
                // Update existing sensor
                await axios.put(`http://localhost:5000/api/settings/sensors/${editingSensor.id}`, {
                    id: editingSensor.id,
                    ...formValues,
                });
                setSnackbar({
                    open: true,
                    message: "Sensor updated successfully!",
                    severity: "success"
                });
            } else {
                // Add new sensor
                await axios.post("http://localhost:5000/api/settings/sensors", formValues);
                setSnackbar({
                    open: true,
                    message: "Sensor added successfully!",
                    severity: "success"
                });
            }
            setModalVisible(false);
            fetchSensors();
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Operation failed.",
                severity: "error"
            });
            console.error(error);
        }
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (id: number) => {
        setDeletingSensorId(id);
        setDeleteDialogOpen(true);
    };

    // Delete sensor
    const handleDelete = async () => {
        if (deletingSensorId === null) return;

        try {
            await axios.delete(`http://localhost:5000/api/settings/sensors/${deletingSensorId}`);
            setSnackbar({
                open: true,
                message: "Sensor deleted successfully!",
                severity: "success"
            });
            fetchSensors();
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to delete sensor.",
                severity: "error"
            });
            console.error(error);
        } finally {
            setDeleteDialogOpen(false);
            setDeletingSensorId(null);
        }
    };

    // Toggle sensor status
    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await axios.put(`http://localhost:5000/api/settings/sensors/${id}/status`, { status: !currentStatus });
            setSnackbar({
                open: true,
                message: `Sensor ${currentStatus ? "deactivated" : "activated"}!`,
                severity: "success"
            });
            fetchSensors();
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to update status.",
                severity: "error"
            });
            console.error(error);
        }
    };

    // Handle page change
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Close snackbar
    const handleSnackbarClose = () => {
        setSnackbar({...snackbar, open: false});
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                borderRadius: 18,
                background: colors.background,
                minHeight: "100vh"
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    borderRadius: "16px",
                    background: colors.cardBg,
                    marginBottom: "20px",
                    overflow: "hidden"
                }}
            >
                <Box sx={{ padding: "24px" }}>
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: "16px" }}>
                        <Grid item>
                            <Box>
                                <Typography variant="h4" sx={{ marginBottom: "4px", color: colors.textPrimary, display: "flex", alignItems: "center", gap: 1 }}>
                                    <LocationOnIcon color="primary" /> Weather Sensor Management
                                </Typography>
                                <Typography variant="body1" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                                    Manage your network of weather monitoring sensors
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Paper elevation={1} sx={{ borderRadius: "16px", padding: "8px 16px" }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <DashboardIcon sx={{ color: colors.secondary }} />
                                    <Typography variant="body1" fontWeight="bold" sx={{ color: colors.textPrimary }}>
                                        {totalActive} Active
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                        of {sensors.length} Total
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Divider sx={{ margin: "12px 0 24px", background: colors.divider }} />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                        <Stack direction="row" spacing={2}>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={loading ? null : <RefreshIcon />}
                                    onClick={fetchSensors}
                                    disabled={loading}
                                    sx={{
                                        borderRadius: "8px",
                                        textTransform: "none"
                                    }}
                                >
                                    {loading ? "Loading..." : "Refresh"}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={openAddModal}
                                    sx={{
                                        borderRadius: "8px",
                                        textTransform: "none"
                                    }}
                                    size="medium"
                                >
                                    Add New Sensor
                                </Button>
                            </motion.div>
                        </Stack>
                    </Box>

                    <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
                        <Table sx={{ minWidth: 650 }} aria-label="sensors table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold", color: colors.textSecondary }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: colors.textSecondary }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: colors.textSecondary }}>Coordinates</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: colors.textSecondary }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: colors.textSecondary }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sensors
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((sensor) => (
                                        <TableRow
                                            key={sensor.id}
                                            component={motion.tr}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: sensor.id * 0.05 }}
                                            sx={{ '&:hover': { backgroundColor: colors.hoverBg } }}
                                        >
                                            <TableCell sx={{ color: colors.textPrimary }}>{sensor.id}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Badge
                                                        variant="dot"
                                                        color={sensor.status ? "success" : "error"}
                                                    />
                                                    <Typography variant="body1" fontWeight="medium" sx={{ color: colors.textPrimary }}>
                                                        {sensor.location}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <ExploreIcon color="primary" fontSize="small" />
                                                    <Tooltip title="View on map">
                                                        <Typography
                                                            component="a"
                                                            href={`https://maps.google.com/?q=${sensor.latitude},${sensor.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{ color: colors.primary, textDecoration: "none" }}
                                                        >
                                                            {sensor.latitude.toFixed(4)}, {sensor.longitude.toFixed(4)}
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                    <Chip
                                                        icon={sensor.status ? <DashboardIcon /> : <WarningIcon />}
                                                        label={sensor.status ? "Active" : "Inactive"}
                                                        color={sensor.status ? "success" : "error"}
                                                        sx={{ borderRadius: "16px" }}
                                                    />
                                                    <Switch
                                                        checked={sensor.status}
                                                        onChange={() => toggleStatus(sensor.id, sensor.status)}
                                                        color="success"
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => openEditModal(sensor)}
                                                            sx={{ borderRadius: "8px", textTransform: "none" }}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => openDeleteDialog(sensor.id)}
                                                            sx={{ borderRadius: "8px", textTransform: "none" }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </motion.div>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {sensors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="textSecondary">
                                                No sensors found. Add one to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[7, 15, 30]}
                        component="div"
                        count={sensors.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            </Paper>

            {/* Add/Edit Sensor Dialog */}
            <Dialog
                open={modalVisible}
                onClose={() => setModalVisible(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {editingSensor ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
                    {editingSensor ? "Edit Weather Sensor" : "Add New Weather Sensor"}
                    <IconButton
                        aria-label="close"
                        onClick={() => setModalVisible(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box component={motion.div}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.4 }}
                         sx={{ pt: 1 }}
                    >
                        <TextField
                            autoFocus
                            margin="dense"
                            id="location"
                            label="Location Name"
                            fullWidth
                            variant="outlined"
                            value={formValues.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <TextField
                                    type="number"
                                    margin="dense"
                                    id="latitude"
                                    label="Latitude"
                                    fullWidth
                                    variant="outlined"
                                    value={formValues.latitude || 0}
                                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                                    required
                                    InputProps={{
                                        startAdornment: <ExploreIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                    helperText="Value between -90 and 90"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    type="number"
                                    margin="dense"
                                    id="longitude"
                                    label="Longitude"
                                    fullWidth
                                    variant="outlined"
                                    value={formValues.longitude || 0}
                                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                                    required
                                    InputProps={{
                                        startAdornment: <ExploreIcon color="action" sx={{ mr: 1 }} />,
                                    }}
                                    helperText="Value between -180 and 180"
                                />
                            </Grid>
                        </Grid>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formValues.status || false}
                                    onChange={(e) => handleInputChange('status', e.target.checked)}
                                    color="success"
                                />
                            }
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <DashboardIcon fontSize="small" />
                                    <Typography>Sensor Status</Typography>
                                </Box>
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    <Button onClick={() => setModalVisible(false)} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: "8px", textTransform: "none" }}>
                        {editingSensor ? "Update Sensor" : "Add Sensor"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Sensor</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this sensor? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: "8px", textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: "8px", textTransform: "none" }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </motion.div>
    );
};

export default SensorManagement;