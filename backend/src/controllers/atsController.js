// @desc    Mock analyze uploaded resume for ATS compatibility
// @route   POST /api/ats/analyze
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const { resumeName } = req.body;

    if (!resumeName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the uploaded resume filename for analysis',
      });
    }

    // Generate dynamic but deterministic scores based on the length of filename
    // to give it a realistic sense of "analyzing" the document
    const seed = resumeName.length;
    
    const contentScore = Math.floor(80 + (seed % 15)); // 80 - 94
    const formattingScore = Math.floor(70 + ((seed * 3) % 20)); // 70 - 89
    const keywordsScore = Math.floor(75 + ((seed * 7) % 18)); // 75 - 92
    const experienceScore = Math.floor(80 + ((seed * 11) % 15)); // 80 - 94
    
    const overallScore = Math.round((contentScore + formattingScore + keywordsScore + experienceScore) / 4);

    const scoreFeedback = overallScore >= 80 ? 'Good Score' : 'Average Score';
    const scoreSummary = overallScore >= 80 
      ? 'Your resume is well-structured but can be improved more.'
      : 'Your resume needs work to bypass applicant tracking filters.';

    const tips = [
      'Use standard section headings (e.g. Work Experience, Education, Skills)',
      'Include relevant keywords matching the job description',
      'Quantify your achievements (e.g. Improved load time by 30%)',
      'Avoid complex formatting (like multi-column tables, diagrams, or graphics)',
      'Ensure complete contact information (email, phone, LinkedIn)',
      'Keep your resume concise and relevant (limit to 1-2 pages)'
    ];

    const topRecommendation = 'Add more relevant keywords from the job description and quantify your achievements to improve your ATS score.';

    res.status(200).json({
      success: true,
      data: {
        filename: resumeName,
        atsScore: overallScore,
        feedback: scoreFeedback,
        summary: scoreSummary,
        breakdown: {
          content: contentScore,
          formatting: formattingScore,
          keywords: keywordsScore,
          experience: experienceScore,
          overall: overallScore
        },
        tips,
        topRecommendation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
