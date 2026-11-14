// main landing page of Internship Scout
'use client';

import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Card, CardContent, CardActions, Chip, CircularProgress, Stack, Paper, Divider } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

// defining the structure of a job result (the data we will be displaying for each internsh`ip)
interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  fit_reason: string;
  apply_url: string;
}

// mock data for testing, delete once api is running
const MOCK_RESULTS: JobResult[] = [
  {
    id: '1',
    title: 'Software QA & Automation Intern',
    company: 'CloudScale Systems',
    location: 'Irvine, CA (Hybrid)',
    score: 94,
    fit_reason: 'Matches your testing interest with hands-on automated regression work in Python and pytest.',
    apply_url: 'https://www.google.com/about/careers/applications/',
  },
  {
    id: '2',
    title: 'Machine Learning Engineering Intern',
    company: 'Apex AI Labs',
    location: 'Remote',
    score: 86,
    fit_reason: 'Great fit for your Python background, focusing on training and evaluating classification models.',
    apply_url: 'https://www.google.com/about/careers/applications/',
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'CivicData Corp',
    location: 'Los Angeles, CA',
    score: 72,
    fit_reason: 'Centers on SQL querying and Python data cleaning, building solid data pipeline experience.',
    apply_url: 'https://www.google.com/about/careers/applications/',
  },
];

/* main page component */

export default function InternshipScoutPage() {
  // state variables to manage user input, loading state, and results
  const [major, setMajor] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // function for verifying and adding user interests to the list
  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (!trimmed || interests.length >= 3) return;
    if (!interests.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setInterests([...interests, trimmed]);
    }
    setInterestInput('');
  };

  // function to handle the Enter key press for adding interests
  const handleInterestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  // function to remove an interest from the list
  const handleDeleteInterest = (interestToRemove: string) => {
    setInterests(interests.filter((item) => item !== interestToRemove));
  };

  // function to reset form and clear all user input and results
  const handleReset = () => {
    setMajor('');
    setInterestInput('');
    setInterests([]);
    setResults([]);
    setTargetRoles([]);
    setHasSearched(false);
    setLoading(false);
  };

  // function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // include internships that are in the input field even if they didnt click add to list
    let finalInterests = [...interests];
    const pendingInput = interestInput.trim();
    if (pendingInput && finalInterests.length < 3 && !finalInterests.includes(pendingInput)) {
      finalInterests.push(pendingInput);
      setInterests(finalInterests);
      setInterestInput('');
    }

    // if no major or interests are provided, do not continue with search
    if (!major.trim() || finalInterests.length === 0) return;

    // simulate loading and fetching results (replace with actual API call in production)
    setLoading(true);
    setHasSearched(true);

    // set timeout 
    setTimeout(() => {
      setTargetRoles(finalInterests.map((item) => `${item} Intern`));
      setResults(MOCK_RESULTS);
      setLoading(false);
    }, 900);
  };

  // this is where the UI components begin
  return (
    <Box
      sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #e3edf7 0%, #f4f6f9 55%, #eef1f6 100%)', py: 7 }}>
      <Container maxWidth="md">

        {/* Header section with title and description of site */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#1a2433', mb: 1.5 }}>
            Internship Scout
          </Typography>
          <Typography variant="body1" sx={{ color: '#526071', maxWidth: 520, mx: 'auto', lineHeight: 1.6 }}>
            Tell us your major and field(s) you are interested in. We’ll help you find internships and rank them based on your preferences.
          </Typography>
        </Box>

        {/* Form section to take in user input of major */}
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #dce4ec', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="What's your major?" placeholder="e.g., Computer Science" value={major} onChange={(e) => setMajor(e.target.value)} helperText="*This field is required." required fullWidth />
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField label={interests.length >= 3 ? 'Max 3 interests added' : `Add an interest (max 3 interests)`}
                  placeholder="ex: Machine Learning, QA Testing, Data Science"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  disabled={interests.length >= 3}
                  fullWidth/>
                <Button type="button" variant="outlined" onClick={handleAddInterest} disabled={!interestInput.trim() || interests.length >= 3} startIcon={<AddRoundedIcon />}
                  sx={{ px: 3, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', borderRadius: 1.5 }}>
                  Add
                </Button>
              </Box>

              {/* Form section to take in user interests */}
              {interests.length > 0 ? (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  {interests.map((item) => (
                    <Chip key={item} label={item} color="primary" variant="outlined" onDelete={() => handleDeleteInterest(item)} sx={{ fontWeight: 500, bgcolor: '#f0f7ff', borderColor: '#b6d4fe' }} />))}
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Add up to 3 areas you enjoy—press Enter or click Add after each one.
                </Typography>
              )}
            </Box>
            
            {/* Submission and reset form buttons */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button type="submit" variant="contained" size="large" disabled={loading || !major.trim() || (interests.length === 0 && !interestInput.trim())}
                sx={{ px: 4, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)'}}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Internships'}
              </Button>

              <Button type="button"
                variant="outlined"
                size="large"
                onClick={handleReset}
                disabled={ loading || (!major && !interestInput && interests.length === 0 && results.length === 0 && !hasSearched)}
                startIcon={<RestartAltRoundedIcon />}
                sx={{ px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#526071', borderColor: '#cbd5e1'}}>
                Reset Form
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Results section to display the internships found by LLM based on user input */}
        {!loading && targetRoles.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#526071', mb: 1 }}>
              Roles we searched for:
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {targetRoles.map((role, idx) => (
                <Chip key={idx} label={role} size="small" sx={{ bgcolor: '#ffffff', border: '1px solid #d0d9e4', fontWeight: 500 }} />))}
            </Stack>
          </Box>
        )}

        {/* Display internship results or a message if no results are found */}
        <Stack spacing={2.5}>
          {!loading &&
            results.map((job) => (<Card key={job.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid #dce4ec', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
              <CardContent sx={{ pb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a2433' }}>
                    {job.title}
                  </Typography>
                  <Chip label={`${job.score}% Match`} color={job.score >= 85 ? 'success' : job.score >= 70 ? 'primary' : 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                </Box>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {job.company} • {job.location}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                  <strong>Why it fits:</strong> {job.fit_reason}
                </Typography>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" variant="outlined" href={job.apply_url} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                  sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}>
                  Apply on Company Site
                </Button>
              </CardActions>
            </Card>
            ))}

          {/* Display a message if no internships are found by LLM */}
          {!loading && hasSearched && results.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No internships found for that combination. Try adjusting your interests.
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  );
}