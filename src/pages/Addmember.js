import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Stack, 
  MenuItem,
  Typography,
  Divider,
  Switch,
  Alert,
  CircularProgress,
  Box,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

// Validation schema for family
const familyValidationSchema = yup.object({
  family_name: yup.string().required('Family name is required'),
  parish: yup.string().required('Parish is required'),
  province: yup.string().required('Province is required'),
  jummuiya: yup.string(),
});

// Validation schema for member
const memberValidationSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  date_of_birth: yup.date().required('DOB is required'),
  relation: yup.string().required('Relation to family is required'),
  baptism_date: yup.date().nullable(),
  is_married: yup.boolean(),
  spouse: yup.string().when('is_married', {
    is: true,
    then: yup.string().required('Spouse name is required'),
    otherwise: yup.string().nullable(),
  }),
  marriage_date: yup.date().when('is_married', {
    is: true,
    then: yup.date().required('Marriage date is required'),
  }),
});

export default function FamilyMemberForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { isAdmin } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState([]);
  const [mode, setMode] = useState('family'); // 'family' or 'member'

  // Formik for family form
  const familyFormik = useFormik({
    initialValues: {
      family_name: '',
      parish: '',
      province: '',
      jummuiya: '',
    },
    validationSchema: familyValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('families')
          .insert([values])
          .select();

        if (error) throw error;
        
        setFamilies([...families, data[0]]);
        familyFormik.resetForm();
        setMode('member');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // Formik for member form
  const memberFormik = useFormik({
    initialValues: {
      family_id: '',
      first_name: '',
      last_name: '',
      date_of_birth: null,
      relation: 'Head',
      baptism_date: null,
      is_married: false,
      marriage_date: null,
      spouse: '',
    },
    validationSchema: memberValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        const formatDate = (date) => date ? date.toISOString() : null;
        const payload = {
          ...values,
          date_of_birth: formatDate(values.date_of_birth),
          baptism_date: formatDate(values.baptism_date),
          marriage_date: values.is_married ? formatDate(values.marriage_date) : null,
        };

        const { error } = isEdit
          ? await supabase.from('members').update(payload).eq('id', id)
          : await supabase.from('members').insert([payload]);

        if (error) throw error;
        navigate('/families');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // Load families and member data (for edit)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch families
        const { data: familiesData, error: familiesError } = await supabase
          .from('families')
          .select('*');
        
        if (familiesError) throw familiesError;
        setFamilies(familiesData);

        // If editing, fetch member data
        if (isEdit) {
          const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .single();

          if (memberError) throw memberError;

          memberFormik.setValues({
            ...memberData,
            date_of_birth: memberData.date_of_birth ? new Date(memberData.date_of_birth) : null,
            baptism_date: memberData.baptism_date ? new Date(memberData.baptism_date) : null,
            marriage_date: memberData.marriage_date ? new Date(memberData.marriage_date) : null,
            is_married: !!memberData.marriage_date,
          });
          setMode('member');
        }

        // If coming from a specific family context (e.g. "Add Member" from Families page)
        const familyIdFromQuery = searchParams.get('familyId');
        if (!isEdit && familyIdFromQuery) {
          setMode('member');
          memberFormik.setFieldValue('family_id', familyIdFromQuery);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, memberFormik]); // Added memberFormik to dependencies

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You do not have permission to manage families or members.
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {mode === 'family' ? 'Add New Family' : isEdit ? 'Edit Family Member' : 'Add Family Member'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {mode === 'family' ? (
          // Family Form
          <Box component="form" onSubmit={familyFormik.handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Family Name *"
                name="family_name"
                value={familyFormik.values.family_name}
                onChange={familyFormik.handleChange}
                error={familyFormik.touched.family_name && Boolean(familyFormik.errors.family_name)}
                helperText={familyFormik.touched.family_name && familyFormik.errors.family_name}
                disabled={loading}
              />

              <TextField
                select
                label="Parish *"
                name="parish"
                value={familyFormik.values.parish}
                onChange={familyFormik.handleChange}
                error={familyFormik.touched.parish && Boolean(familyFormik.errors.parish)}
                helperText={familyFormik.touched.parish && familyFormik.errors.parish}
                disabled={loading}
              >
                {['St. Mary', 'Sacred Heart', 'Our Lady of Guadalupe'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Province *"
                name="province"
                value={familyFormik.values.province}
                onChange={familyFormik.handleChange}
                error={familyFormik.touched.province && Boolean(familyFormik.errors.province)}
                helperText={familyFormik.touched.province && familyFormik.errors.province}
                disabled={loading}
              />

              <TextField
                label="Jummuiya (Small Christian Community)"
                name="jummuiya"
                value={familyFormik.values.jummuiya}
                onChange={familyFormik.handleChange}
                disabled={loading}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/families')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Save Family
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          // Member Form
          <Box component="form" onSubmit={memberFormik.handleSubmit}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel id="family-select-label">Family *</InputLabel>
                <Select
                  labelId="family-select-label"
                  id="family_id"
                  name="family_id"
                  value={memberFormik.values.family_id}
                  onChange={memberFormik.handleChange}
                  label="Family *"
                  disabled={loading || isEdit}
                >
                  {families.map((family) => (
                    <MenuItem key={family.id} value={family.id}>
                      {family.family_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <TextField
                  fullWidth
                  label="First Name *"
                  name="first_name"
                  value={memberFormik.values.first_name}
                  onChange={memberFormik.handleChange}
                  error={memberFormik.touched.first_name && Boolean(memberFormik.errors.first_name)}
                  helperText={memberFormik.touched.first_name && memberFormik.errors.first_name}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Last Name *"
                  name="last_name"
                  value={memberFormik.values.last_name}
                  onChange={memberFormik.handleChange}
                  error={memberFormik.touched.last_name && Boolean(memberFormik.errors.last_name)}
                  helperText={memberFormik.touched.last_name && memberFormik.errors.last_name}
                  disabled={loading}
                />
              </Stack>

              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <DatePicker
                  label="Date of Birth *"
                  value={memberFormik.values.date_of_birth}
                  onChange={(date) => memberFormik.setFieldValue('date_of_birth', date)}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: memberFormik.touched.date_of_birth && Boolean(memberFormik.errors.date_of_birth),
                      helperText: memberFormik.touched.date_of_birth && memberFormik.errors.date_of_birth,
                    },
                  }}
                />
                <TextField
                  select
                  fullWidth
                  label="Relation to Family *"
                  name="relation"
                  value={memberFormik.values.relation}
                  onChange={memberFormik.handleChange}
                  error={memberFormik.touched.relation && Boolean(memberFormik.errors.relation)}
                  helperText={memberFormik.touched.relation && memberFormik.errors.relation}
                  disabled={loading}
                >
                  {['Head', 'Spouse', 'Child', 'Other'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Typography variant="subtitle1">Sacramental Records</Typography>
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <DatePicker
                  label="Baptism Date"
                  value={memberFormik.values.baptism_date}
                  onChange={(date) => memberFormik.setFieldValue('baptism_date', date)}
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                />
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography>Married:</Typography>
                <Switch
                  checked={memberFormik.values.is_married}
                  onChange={(e) => memberFormik.setFieldValue('is_married', e.target.checked)}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Spouse Name"
                  name="spouse"
                  value={memberFormik.values.spouse}
                  onChange={memberFormik.handleChange}
                  error={memberFormik.touched.spouse && Boolean(memberFormik.errors.spouse)}
                  helperText={memberFormik.touched.spouse && memberFormik.errors.spouse}
                  disabled={loading}
                />
                {memberFormik.values.is_married && (
                  <DatePicker
                    label="Marriage Date *"
                    value={memberFormik.values.marriage_date}
                    onChange={(date) => memberFormik.setFieldValue('marriage_date', date)}
                    disabled={loading}
                    sx={{ minWidth: 200 }}
                    slotProps={{
                      textField: {
                        error: memberFormik.touched.marriage_date && Boolean(memberFormik.errors.marriage_date),
                        helperText: memberFormik.touched.marriage_date && memberFormik.errors.marriage_date,
                      },
                    }}
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={() => setMode('family')}
                  disabled={loading}
                >
                  Back to Family
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/families')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {isEdit ? 'Update' : 'Save'} Member
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}