import { useState, useEffect } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import { Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../auth/AuthProvider';
import { Add, PersonAdd, Visibility } from '@mui/icons-material';

export default function Families() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [families, setFamilies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFamilies(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();

    const subscription = supabase
      .channel('families_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'families',
        },
        () => fetchFamilies()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'family_name', headerName: 'Family Name', flex: 1, minWidth: 180 },
    { field: 'parish', headerName: 'Parish', flex: 1, minWidth: 150 },
    { field: 'province', headerName: 'Province', flex: 1, minWidth: 150 },
    { field: 'jummuiya', headerName: 'Jumuiya', flex: 1, minWidth: 150 },
  ];

  if (isAdmin) {
    columns.push({
      field: 'actions',
      type: 'actions',
      width: 180,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View Family"
          onClick={() => navigate(`/families/${params.id}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<PersonAdd />}
          label="Add Member"
          onClick={() => navigate(`/Addmembers?familyId=${params.id}`)}
          showInMenu={false}
        />,
      ],
    });
  }

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
          onClick={() => navigate('/Addmembers')}
          sx={{ mb: 2 }}
        >
          Add New Family
        </Button>
      )}

      <DataGrid
        rows={families}
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


