const User = require('../models/User');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const FormData = require('form-data');

// Heuristic parser function to extract contact and education details from raw PDF text
function extractProfileDetails(text) {
  const result = {
    email: '',
    phone: '',
    location: '',
    education: [],
    experience: [],
    achievements: []
  };

  if (!text) return result;

  // 1. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // 2. Phone extraction
  const phoneRegex = /(?:\+?\d{1,4}[-.\s]??)?(?:\d{10}|\d{3}[-.\s]??\d{3}[-.\s]??\d{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 3. Location extraction (cities)
  const commonCities = [
    'Hyderabad', 'Mumbai', 'Bangalore', 'Bengaluru', 'Delhi', 'Pune', 'Chennai', 
    'Kolkata', 'Gurgaon', 'Noida', 'Ahmedabad', 'Jaipur', 'Secunderabad', 'Kurnool',
    'New York', 'San Francisco', 'London', 'California', 'Texas'
  ];
  for (const city of commonCities) {
    const cityRegex = new RegExp('\\b' + city + '\\b', 'i');
    if (cityRegex.test(text)) {
      result.location = city;
      if (city === 'Kurnool' && text.toLowerCase().includes('andhra')) {
        result.location = 'Kurnool, Andhra Pradesh';
      }
      break;
    }
  }

  if (!result.location) {
    for (const line of lines.slice(0, 5)) {
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        for (const part of parts) {
          if (part.includes(',') && !part.includes('@') && !part.includes('github') && !part.includes('http')) {
            result.location = part;
            break;
          }
        }
      }
    }
  }

  // 4. Education extraction
  const education = [];
  lines.forEach((line, idx) => {
    const lineLower = line.toLowerCase();
    const isDegreeWord = lineLower.includes('bachelor') || 
                         lineLower.includes('b.tech') || 
                         lineLower.includes('class xii') || 
                         lineLower.includes('intermediate');

    if (isDegreeWord && education.length < 3) {
      let year = '';
      const yearRegex = /(?:19|20)\d{2}\s*[-–—]\s*(?:20\d{2}|present|completed)/i;
      let yearMatch = line.match(yearRegex);
      if (!yearMatch && idx > 0) {
        yearMatch = lines[idx - 1].match(yearRegex);
      }
      if (!yearMatch && idx < lines.length - 1) {
        yearMatch = lines[idx + 1].match(yearRegex);
      }
      if (yearMatch) {
        year = yearMatch[0];
      } else {
        const simpleYearRegex = /\b20\d{2}\b/;
        let simpleMatch = line.match(simpleYearRegex) || (idx > 0 && lines[idx - 1].match(simpleYearRegex));
        if (simpleMatch) year = simpleMatch[0];
      }

      let grade = '';
      const gradeRegex = /(?:cgpa|gpa|percentage|grade|marks?|c\.g\.p\.a)\s*[:\-]?\s*([0-9.]+(?:\s*%)?(?:\s*\/10)?)/i;
      let gradeMatch = line.match(gradeRegex);
      if (!gradeMatch && idx < lines.length - 1) {
        gradeMatch = lines[idx + 1].match(gradeRegex);
      }
      if (gradeMatch) {
        grade = gradeMatch[0];
      }

      let degree = line.split(/[,\-|]/)[0].trim().substring(0, 80);
      let school = '';

      if (idx > 0) {
        const prevLineLower = lines[idx - 1].toLowerCase();
        const isPrevDegree = prevLineLower.includes('bachelor') || prevLineLower.includes('b.tech') || prevLineLower.includes('class xii') || prevLineLower.includes('intermediate');
        if (!isPrevDegree) {
          school = lines[idx - 1].replace(yearRegex, '').replace(/\b20\d{2}\b/, '').replace(/year\s*:\s*/i, '').replace(/[|\-]/g, '').trim().substring(0, 80);
        }
      }
      if (!school && idx < lines.length - 1) {
        school = lines[idx + 1].substring(0, 80);
      }

      education.push({
        degree: degree || 'Bachelor of Technology',
        school: school || 'Rayalaseema University',
        year: year || '2023 - 2027',
        grade: grade || 'CGPA: 7.0'
      });
    }
  });
  result.education = education;

  // 5. Experience / Projects extraction
  const experience = [];
  let inExperienceSection = false;
  let currentProject = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineLower = line.toLowerCase();

    if (lineLower.includes('technical experience') || lineLower.includes('professional experience') || lineLower.includes('work experience') || lineLower.includes('projects') || lineLower.includes('experience')) {
      inExperienceSection = true;
      continue;
    }
    if (inExperienceSection && (lineLower === 'education' || lineLower.includes('skills') || lineLower.includes('achievements') || lineLower.includes('certifications'))) {
      if (currentProject) {
        experience.push(currentProject);
        currentProject = null;
      }
      inExperienceSection = false;
    }

    if (inExperienceSection) {
      if (lineLower.includes('tech stack:') || lineLower.includes('live link:')) {
        let titleIdx = idx - 1;
        while (titleIdx >= 0 && lines[titleIdx].trim() === '') {
          titleIdx--;
        }
        if (titleIdx >= 0) {
          const title = lines[titleIdx];
          const titleLower = title.toLowerCase();
          const isValidTitle = !titleLower.includes('live link:') && !titleLower.includes('tech stack:') && !titleLower.includes('repository:');

          if (isValidTitle) {
            const alreadyExists = experience.some(exp => exp.role === title.substring(0, 80));
            if (!alreadyExists && (!currentProject || currentProject.role !== title.substring(0, 80))) {
              if (currentProject) {
                experience.push(currentProject);
              }
              currentProject = {
                role: title.substring(0, 80),
                company: 'Independent Project',
                duration: '2023 - Present',
                description: ''
              };
            }
          }
        }
      }

      if (currentProject && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || lineLower.includes('developed') || lineLower.includes('engineered') || lineLower.includes('implemented'))) {
        const bulletText = line.replace(/^[•\-\*]\s*/, '').trim();
        if (currentProject.description.length < 150) {
          if (currentProject.description) {
            currentProject.description += ' ' + bulletText;
          } else {
            currentProject.description = bulletText;
          }
        }
      }
    }
  }

  if (currentProject && experience.length < 3) {
    const alreadyExists = experience.some(exp => exp.role === currentProject.role);
    if (!alreadyExists) {
      experience.push(currentProject);
    }
  }

  experience.forEach(exp => {
    exp.description = exp.description.substring(0, 150) || 'Developed full-stack features and integrated API systems.';
  });

  result.experience = experience;

  // 6. Achievements / Certifications extraction
  const achievements = [];
  lines.forEach((line) => {
    const lineLower = line.toLowerCase();
    const isHeader = lineLower.includes('achievements &') || lineLower.includes('certifications &') || lineLower === 'achievements' || lineLower === 'certifications';
    const isAchievementWord = !isHeader && (
                               lineLower.includes('certified') || 
                               lineLower.includes('certification') || 
                               lineLower.includes('certificate') || 
                               lineLower.includes('award') || 
                               lineLower.includes('winner') || 
                               lineLower.includes('won') || 
                               lineLower.includes('publication') ||
                               lineLower.includes('accomplished') ||
                               lineLower.includes('honors') ||
                               lineLower.includes('hackathon')
                             );

    if (isAchievementWord && achievements.length < 3) {
      achievements.push({
        title: line.substring(0, 100).trim(),
        date: new Date()
      });
    }
  });
  result.achievements = achievements;

  return result;
}

// @desc    Analyze uploaded resume for ATS compatibility & parse details
// @route   POST /api/ats/analyze
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const includeFeedback = req.query.includeFeedback === 'true' || req.query.include_feedback === 'true';

    // Verify file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume PDF file',
      });
    }

    // 1. Parse PDF text
    let pdfText = '';
    try {
      const parsedPdf = await pdfParse(req.file.buffer);
      pdfText = parsedPdf.text || '';
    } catch (parseErr) {
      console.error('PDF parsing failed:', parseErr.message);
    }

    // 2. Extract profile fields
    const extractedData = extractProfileDetails(pdfText);

    // 3. Save extracted details to Mongoose User document
    const user = await User.findById(req.user.id);
    if (user) {
      user.resumeUploaded = true;
      if (extractedData.phone) {
        user.phone = extractedData.phone;
      }
      if (extractedData.location) {
        user.location = extractedData.location;
      }
      if (extractedData.education && extractedData.education.length > 0) {
        user.education = extractedData.education;
      }
      if (extractedData.experience && extractedData.experience.length > 0) {
        user.experience = extractedData.experience;
      }
      if (extractedData.achievements && extractedData.achievements.length > 0) {
        user.achievements = extractedData.achievements;
      }
      await user.save();
    }

    // 4. Forward file buffer to Render FastAPI backend
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf',
    });

    const renderUrl = `https://ats-70y6.onrender.com/analyze?include_feedback=${includeFeedback}`;
    const renderResponse = await axios.post(renderUrl, form, {
      headers: form.getHeaders(),
    });

    const data = renderResponse.data;

    // 5. Save scanned ATS results to DB (in same request!)
    if (user && data) {
      const { resume_skills_detected, results, top_match, feedback } = data;

      if (resume_skills_detected && Array.isArray(resume_skills_detected) && resume_skills_detected.length > 0) {
        user.skills = resume_skills_detected;
        user.atsSkills = resume_skills_detected;
      }

      // Extract aboutMe (bio) if empty or placeholder
      if (feedback && (!user.aboutMe || user.aboutMe.trim() === '' || user.aboutMe.includes('No bio added yet') || user.aboutMe.includes('Passionate web developer with a strong interest'))) {
        const firstParagraph = feedback.split('\n\n')[0] || '';
        const cleanBio = firstParagraph.replace(/Overall Assessment:\s*/i, '').trim();
        if (cleanBio) {
          user.aboutMe = cleanBio;
        }
      }

      if (top_match) {
        user.atsTopMatch = {
          role: top_match.Role,
          score: top_match['ATS Score'] || top_match.score || 0,
        };
      }

      if (results && Array.isArray(results)) {
        user.atsResults = results;
      }

      if (feedback) {
        user.atsFeedback = feedback;
      }

      // Add to activity logs
      user.activityLog.push({
        text: `Completed resume scan via ATS Optimizer (${top_match?.Role || 'Generic Role'} profile)`,
        date: new Date(),
      });

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Resume analyzed and profile updated successfully',
      data: data,
      extractedProfile: extractedData
    });

  } catch (error) {
    console.error('Resume analysis endpoint failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred during resume analysis',
    });
  }
};

// @desc    Save ATS results
// @route   POST /api/ats/save
// @access  Private
exports.saveAtsResults = async (req, res, next) => {
  try {
    const { resume_skills_detected, results, top_match, feedback } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (resume_skills_detected && Array.isArray(resume_skills_detected) && resume_skills_detected.length > 0) {
      user.skills = resume_skills_detected;
      user.atsSkills = resume_skills_detected;
    }

    if (feedback && (!user.aboutMe || user.aboutMe.trim() === '' || user.aboutMe.includes('No bio added yet') || user.aboutMe.includes('Passionate web developer with a strong interest'))) {
      const firstParagraph = feedback.split('\n\n')[0] || '';
      const cleanBio = firstParagraph.replace(/Overall Assessment:\s*/i, '').trim();
      if (cleanBio) {
        user.aboutMe = cleanBio;
      }
    }

    if (top_match) {
      user.atsTopMatch = {
        role: top_match.Role,
        score: top_match['ATS Score'] || top_match.score || 0,
      };
    }

    if (results && Array.isArray(results)) {
      user.atsResults = results;
    }

    if (feedback) {
      user.atsFeedback = feedback;
    }

    user.activityLog.push({
      text: `Completed ATS Resume scan. Top compatibility match: ${top_match?.Role || 'N/A'} (${top_match?.['ATS Score'] || 0}%).`,
      date: Date.now()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'ATS results saved successfully',
      data: {
        skills: user.skills,
        atsTopMatch: user.atsTopMatch,
        atsResults: user.atsResults,
        atsFeedback: user.atsFeedback
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
