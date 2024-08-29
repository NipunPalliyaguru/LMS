import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { setSearchTerm } from '../../Search/Searchslice';
import { useDeleteAssignmentMutation } from '../teachersApiSlice';
import { Box, Dialog, DialogContent, IconButton, Card, CardContent, Typography, Grid, Pagination, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UpdateAssignment } from './UpdateAssignment';
import Loading from '../../../Components/Loading';

export const ViewCourses = ({ data }) => {
  const { classId } = useParams(); // Retrieve classId from the URL parameters

  const [deleteAssignment, { isLoading }] = useDeleteAssignmentMutation();

  const { searchTerm } = useSelector(setSearchTerm);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({
    subject: '',
    description: '',
    lastDate: '',
    assignedBy: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleEdit = (id) => {
    const selectedItem = data?.find((item) => item.id === id);
    setSelectedItemId(id);
    setEditedItem(selectedItem);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    setEditDialogOpen(false);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Do you really want to delete this item?');
    if (confirmDelete) {
      deleteAssignment({ classId: classId, id })
        .unwrap()
        .then((response) => toast.success(response.message))
        .catch((error) => {
          const errorMessage = error?.error?.message || error?.data?.error?.message || 'An error occurred.';
          toast.error(errorMessage);
        });
    } else return;
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredData = data?.filter((item) => {
    const term = searchTerm ?? '';
    if (term.trim() === '') return true;
    return (
      (item.subject && item.subject.toLowerCase().includes(term.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(term.toLowerCase())) ||
      (item.lastDate && item.lastDate.includes(term)) ||
      (item.assignedBy && item.assignedBy.toLowerCase().includes(term.toLowerCase()))
    );
  });

  const sortedData = filteredData?.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.subject.localeCompare(b.subject);
    } else {
      return b.subject.localeCompare(a.subject);
    }
  });

  const paginatedData = sortedData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box sx={{ width: '100%', marginTop: '20px' }}>
      <ToastContainer />
      {isLoading ? (
        <Loading open={isLoading} />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortOrder} onChange={handleSortChange} label="Sort By">
                <MenuItem value="asc">Subject (A-Z)</MenuItem>
                <MenuItem value="desc">Subject (Z-A)</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Items per page</InputLabel>
              <Select value={itemsPerPage} onChange={handleItemsPerPageChange} label="Items per page">
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Grid container spacing={2}>
            {paginatedData?.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h3">{item.subject}</Typography>
                    <Typography variant="h3"><hr></hr></Typography>
                    <Typography variant="body2" align="justify">{item.description}</Typography>
                    <Typography variant="body2" mt={2}>Assigned by: {item.assignedBy}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton color="primary" onClick={() => handleEdit(item.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredData.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
          <Dialog open={editDialogOpen} onClose={handleSaveEdit}>
            <DialogContent>
              <UpdateAssignment data={editedItem} id={selectedItemId} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};
