import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, PersonAdd } from '@mui/icons-material';
import { supabase } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

export default function FamilyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [{ data: familyData, error: familyError }, { data: membersData, error: membersError }] =
          await Promise.all([
            supabase.from('families').select('*').eq('id', id).single(),
            supabase.from('members').select('*').eq('family_id', id).order('date_of_birth', { ascending: true }),
          ]);

        if (familyError) throw familyError;
        if (membersError) throw membersError;

        setFamily(familyData);
        setMembers(membersData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const memberColumns = [
    {
      field: 'full_name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) =>
        `${params.row.first_name || ''} ${params.row.middle_name || ''} ${params.row.last_name || ''}`.trim(),
    },
    {
      field: 'relation',
      headerName: 'Relation',
      width: 130,
    },
    {
      field: 'date_of_birth',
      headerName: 'Birthday',
      width: 130,
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
      type: 'date',
    },
    {
      field: 'baptism_date',
      headerName: 'Baptism Day',
      width: 150,
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
      type: 'date',
    },
    {
      field: 'marriage_date',
      headerName: 'Marriage Day',
      width: 150,
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
      type: 'date',
    },
    {
      field: 'spouse',
      headerName: 'Spouse',
      flex: 1,
      minWidth: 150,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/families')}
            variant="outlined"
          >
            Back to Families
          </Button>
          <Typography variant="h5">
            Family Details
          </Typography>
        </Stack>
        {family && isAdmin && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate(`/Addmembers?familyId=${family.id}`)}
          >
            Add Member
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {family ? (
            <Stack spacing={2}>
              <Typography variant="h6">
                {family.family_name}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {family.parish && (
                  <Chip label={`Parish: ${family.parish}`} />
                )}
                {family.province && (
                  <Chip label={`Province: ${family.province}`} />
                )}
                {family.jummuiya && (
                  <Chip label={`Jumuiya: ${family.jummuiya}`} />
                )}
              </Stack>
            </Stack>
          ) : (
            <Typography color="text.secondary">
              {loading ? 'Loading family...' : 'Family not found.'}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{ height: 400, width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Family Members
        </Typography>
        <DataGrid
          rows={members}
          columns={memberColumns}
          loading={loading}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}