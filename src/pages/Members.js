import { useState, useEffect } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import { Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

export default function Members() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch members from Supabase
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete member
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMembers(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  // Define columns inside the component
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'full_name',
      headerName: 'Full Name',
      width: 200,
      valueGetter: (params) =>
        `${params.row.first_name} ${params.row.middle_name || ''} ${params.row.last_name}`.trim()
    },
    {
      field: 'date_of_birth', headerName: 'DOB', width: 100, type: 'date',
      valueGetter: (params) => params.value ? new Date(params.value) : null
    },
    {
      field: 'baptism_date', headerName: 'Baptism', width: 100, type: 'date',
      valueGetter: (params) => params.value ? new Date(params.value) : null
    },
    {
      field: 'communion_date', headerName: 'Communion', width: 100, type: 'date',
      valueGetter: (params) => params.value ? new Date(params.value) : null
    },
    {
      field: 'confirmation_date', headerName: 'Confirmation', width: 100, type: 'date',
      valueGetter: (params) => params.value ? new Date(params.value) : null
    },
    {
      field: 'marriage_date', headerName: 'Married', width: 100, type: 'date',
      valueGetter: (params) => params.value ? new Date(params.value) : null
    },
    { field: 'parish', headerName: 'Parish', width: 150 },
    { field: 'jummuiya', headerName: 'Jummuiya', width: 150 },
  ];

  if (isAdmin) {
    columns.push({
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => navigate(`/members/${params.id}/edit`)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
          color="error"
        />,
      ],
    });
  }

  // Realtime subscription
  useEffect(() => {
    fetchMembers();

    const subscription = supabase
      .channel('members_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'members'
      }, () => fetchMembers())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={{ height: 600, width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isAdmin && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/families')}
          sx={{ mb: 2 }}
        >
          Add Member
        </Button>
      )}

      <DataGrid
        rows={members}
        columns={columns}
        loading={loading}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
}
