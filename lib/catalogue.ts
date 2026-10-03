import { enrich, type RichOpportunity } from "./domain";
// Source facts checked 2 October 2026. A check does not imply current availability.
// Unknown dates are deliberately not turned into countdowns.
export const catalogue:RichOpportunity[] = [
  {
    "id": "springpod-engineering",
    "title": "Find your place in engineering",
    "provider": "Springpod",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Engineering",
    "url": "https://www.springpod.com/virtual-work-experience/search",
    "description": "Browse engineering experiences. Select a programme to check its current requirements.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · UK",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Not stated",
    "deadline": "Varies by programme",
    "tags": [
      "Engineering",
      "Virtual"
    ],
    "format": "Virtual"
  },
  {
    "id": "leonardo",
    "title": "Inside the world of Leonardo",
    "provider": "Leonardo · Springpod",
    "category": "Virtual work experience",
    "type": "Virtual work experience",
    "sector": "Engineering",
    "url": "https://www.leonardo.springpod.com/experiences/virtual-work-experience-with-leonardo",
    "description": "Explore electronics, aerospace and radar through practical activities and industry insights.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Virtual",
    "duration": "Not stated",
    "eligibility": "Provider welcomes all ages; check current terms",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "Aerospace",
      "Electronics"
    ],
    "format": "Virtual",
    "activities": [
      "Quizzes and practical activities",
      "Explore early career pathways"
    ],
    "certificate": "Completion certificate"
  },
  {
    "id": "forage-tech",
    "title": "Try a career in technology",
    "provider": "Forage",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Technology",
    "url": "https://www.theforage.com/simulations",
    "description": "Browse employer-designed coding and cybersecurity simulations. These are learning activities, not employment.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · self-paced",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Free",
    "deadline": "Varies by programme",
    "tags": [
      "Coding",
      "Cybersecurity",
      "Job simulations"
    ],
    "format": "Virtual",
    "durationBand": "Self-paced"
  },
  {
    "id": "springpod-health",
    "title": "Explore a future in healthcare",
    "provider": "Springpod",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Healthcare",
    "url": "https://www.springpod.com/virtual-work-experience/search",
    "description": "Choose a healthcare programme and check its individual eligibility.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · UK",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Not stated",
    "deadline": "Varies by programme",
    "tags": [
      "Medicine",
      "Healthcare"
    ],
    "format": "Virtual"
  },
  {
    "id": "forage-finance",
    "title": "Step into business & finance",
    "provider": "Forage",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Business & finance",
    "url": "https://www.theforage.com/simulations",
    "description": "Compare banking, accounting and consulting simulations. These are learning activities, not employment.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · self-paced",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Free",
    "deadline": "Varies by programme",
    "tags": [
      "Banking",
      "Consulting",
      "Job simulations"
    ],
    "format": "Virtual",
    "durationBand": "Self-paced"
  },
  {
    "id": "forage-law",
    "title": "See what a legal career looks like",
    "provider": "Forage",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Law",
    "url": "https://www.theforage.com/simulations",
    "description": "Browse legal job simulations and choose a specific programme to try.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · self-paced",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Free",
    "deadline": "Varies by programme",
    "tags": [
      "Law",
      "Job simulations"
    ],
    "format": "Virtual",
    "durationBand": "Self-paced"
  },
  {
    "id": "springpod-creative",
    "title": "Discover the creative industries",
    "provider": "Springpod",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Creative & media",
    "url": "https://www.springpod.com/virtual-work-experience/search",
    "description": "Browse creative career experiences, then confirm dates and requirements on the programme page.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · UK",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Not stated",
    "deadline": "Varies by programme",
    "tags": [
      "Media",
      "Marketing"
    ],
    "format": "Virtual"
  },
  {
    "id": "springpod-tech",
    "title": "Discover technology work experience",
    "provider": "Springpod",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Technology",
    "url": "https://www.springpod.com/virtual-work-experience/search",
    "description": "Browse technology programmes and compare their requirements.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Virtual · UK",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Not stated",
    "deadline": "Varies by programme",
    "tags": [
      "Technology",
      "Digital"
    ],
    "format": "Virtual"
  },
  {
    "id": "cambridge-stem-smart",
    "title": "STEM SMART",
    "provider": "University of Cambridge",
    "category": "STEM programme",
    "type": "STEM programme",
    "sector": "Science & research",
    "url": "https://www.undergraduate.study.cam.ac.uk/find-out-more/widening-participation/stem-smart",
    "description": "Weekly STEM assignments, tutorials and mentoring alongside school studies. Additional criteria apply.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online · Cambridge residential for selected participants",
    "duration": "16 months",
    "eligibility": "Starts in Year 12 or equivalent; check academic and non-academic eligibility",
    "cost": "Free",
    "deadline": "31 October 2026",
    "tags": [
      "STEM",
      "Mentoring",
      "Widening participation"
    ],
    "format": "Hybrid",
    "years": [
      "Year 12"
    ],
    "subjects": [
      "Maths",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Further Maths"
    ],
    "subjectRequirements": "Maths and at least one listed STEM A level; GCSE Maths grade 7 and science criteria apply",
    "geography": "UK state-school and educational-disadvantage criteria apply",
    "durationBand": "Longer programme",
    "startDate": "2027-01-09",
    "deadlineDate": "2026-10-31",
    "applicationState": "Open",
    "certificate": "Certificate for commitment after phase 2",
    "activities": [
      "Weekly assignments and online tutorials",
      "Mentoring with a Cambridge student"
    ],
    "skills": [
      "Problem solving"
    ]
  },
  {
    "id": "oxford-uniq",
    "title": "UNIQ residential and application support",
    "provider": "University of Oxford",
    "category": "Summer school",
    "type": "Summer school",
    "sector": "Explore careers",
    "url": "https://www.uniq.ox.ac.uk/",
    "description": "Academic residential and online application support for students from backgrounds underrepresented at Oxford.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Oxford · online support",
    "duration": "One-week residential plus support",
    "eligibility": "First year of sixth form; age-at-residential rules and exceptions apply. Check selection criteria.",
    "cost": "Free",
    "deadline": "2027 deadline not announced; applications open December 2026",
    "tags": [
      "University",
      "Widening participation"
    ],
    "format": "Hybrid",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "geography": "UK and Islands state schools; Year 13 is the Northern Ireland equivalent",
    "subjects": [
      "Maths",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "English",
      "History",
      "Law",
      "Economics"
    ],
    "durationBand": "Longer programme",
    "applicationState": "Not yet open",
    "selection": "Good grades and underrepresented backgrounds prioritised",
    "activities": [
      "Subject seminars and lectures",
      "University application support"
    ],
    "sourceUrls": [
      "https://www.uniq.ox.ac.uk/",
      "https://www.uniq.ox.ac.uk/selection-criteria",
      "https://www.uniq.ox.ac.uk/courses"
    ]
  },
  {
    "id": "apply-cambridge",
    "title": "Apply: Cambridge",
    "provider": "University of Cambridge",
    "category": "Mentoring",
    "type": "Mentoring",
    "sector": "Explore careers",
    "url": "https://www.undergraduate.study.cam.ac.uk/find-out-more/widening-participation/apply-cambridge",
    "description": "Admissions guidance and student mentoring for high-attaining students from underrepresented backgrounds.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online · UK",
    "duration": "June 2026–January 2027 cycle",
    "eligibility": "UK state school; Year 12 England/Wales, Year 13 Northern Ireland or S5. Additional criteria apply.",
    "cost": "Free",
    "deadline": "2026 applications closed; check back in spring 2027",
    "tags": [
      "Mentoring",
      "University outreach"
    ],
    "format": "Virtual",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "geography": "UK home-fee criteria apply",
    "applicationState": "Closed",
    "durationBand": "Longer programme",
    "selection": "Competitive places",
    "activities": [
      "Admissions-test and interview practice",
      "Cambridge student mentoring"
    ]
  },
  {
    "id": "in2stem",
    "title": "In2STEM summer placements",
    "provider": "In2scienceUK",
    "category": "Work experience",
    "type": "Work experience",
    "sector": "Science & research",
    "url": "https://in2scienceuk.org/our-programmes/in2stem/apply/",
    "description": "A STEM placement with online skills workshops for eligible students from disadvantaged backgrounds.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Placement within commuting distance",
    "duration": "1–2 week placement plus workshops",
    "eligibility": "Year 12 or Scottish S5/S6, 16+, non-selective state school; location and additional criteria apply",
    "cost": "Free",
    "deadline": "2026 applications closed; next cycle not confirmed",
    "tags": [
      "Research",
      "STEM",
      "Widening participation"
    ],
    "format": "Hybrid",
    "minAge": 16,
    "years": [
      "Year 12"
    ],
    "subjects": [
      "Maths",
      "Biology",
      "Chemistry",
      "Physics",
      "Computer Science"
    ],
    "subjectRequirements": "At least one STEM A level or equivalent",
    "geography": "Check supported locations and full criteria",
    "durationBand": "1–2 weeks",
    "applicationState": "Closed",
    "certificate": "Digital participation certificate if criteria met",
    "selection": "Competitive shortlisting with teacher reference",
    "activities": [
      "In-person STEM placement",
      "Online workshops and public-engagement competitions"
    ],
    "sourceUrls": [
      "https://in2scienceuk.org/our-programmes/in2stem/apply/",
      "https://in2scienceuk.org/our-programmes/in2stem/faqs/"
    ]
  },
  {
    "id": "observe-gp",
    "title": "Observe GP",
    "provider": "Royal College of General Practitioners",
    "category": "Virtual work experience",
    "type": "Virtual work experience",
    "sector": "Healthcare",
    "url": "https://www.rcgp.org.uk/observegp",
    "description": "Interactive videos showing the work of GPs and the primary care team. An alternative to clinical placement experience.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online · UK residents",
    "duration": "Not stated",
    "eligibility": "Aspiring medics aged 16+ living in the UK",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "Medicine",
      "General practice"
    ],
    "format": "Virtual",
    "minAge": 16,
    "geography": "Aspiring medics living in the UK",
    "certificate": "No completion certificate",
    "activities": [
      "Observe recorded primary care consultations",
      "Use a reflective diary"
    ]
  },
  {
    "id": "bsms-vwe",
    "title": "BSMS Virtual Work Experience",
    "provider": "Brighton and Sussex Medical School",
    "category": "Virtual work experience",
    "type": "Virtual work experience",
    "sector": "Healthcare",
    "url": "https://www.bsms.ac.uk/about/info-for-schools-teachers-parents/outreach-activity-and-resources-for-all.aspx",
    "description": "Explore NHS roles and medical specialties through an online resource for prospective medical students.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online",
    "duration": "Not stated",
    "eligibility": "For those considering medicine; age and school year restrictions not stated",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "Medicine",
      "NHS"
    ],
    "format": "Virtual",
    "activities": [
      "Explore six medical specialties",
      "Consider challenges facing doctors"
    ],
    "sourceUrls": [
      "https://www.bsms.ac.uk/about/info-for-schools-teachers-parents/outreach-activity-and-resources-for-all.aspx",
      "https://www.bsms.ac.uk/undergraduate/open-days/virtual-open-day/admissions.aspx"
    ]
  },
  {
    "id": "imperial-summer",
    "title": "Year 12 Sutton Trust Summer School",
    "provider": "Imperial College London",
    "category": "Summer school",
    "type": "Summer school",
    "sector": "Science & research",
    "url": "https://www.imperial.ac.uk/be-inspired/schools-outreach/secondary-schools/summer-schools/sutton-trust/",
    "description": "Experience studying STEM at Imperial through its residential widening-participation summer school.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "London",
    "duration": "Four-day residential",
    "eligibility": "Year 12 state-school students; academic and widening-participation criteria apply",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "University",
      "STEM",
      "Widening participation"
    ],
    "format": "In person",
    "years": [
      "Year 12"
    ],
    "geography": "Eligible students across the UK; check travel support",
    "durationBand": "4–7 days",
    "subjects": [
      "Maths",
      "Physics",
      "Chemistry",
      "Biology"
    ],
    "activities": [
      "Explore university study and STEM"
    ]
  },
  {
    "id": "nuffield",
    "title": "Nuffield Research Placements",
    "provider": "STEM Learning",
    "category": "Research placement",
    "type": "Research placement",
    "sector": "Science & research",
    "url": "https://www.stem.org.uk/sites/default/files/pages/downloads/Guide-for-Student-Applicants_Nuffield-Research-Placements.pdf",
    "description": "Research projects for first-year sixth-form students. This source is a programme guide; current-cycle details need checking.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "UK host organisations",
    "duration": "Check current cycle; published guides differ",
    "eligibility": "State-funded Year 12/S5, over 16; grades and additional criteria apply. Confirm current eligibility.",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "Research",
      "STEM"
    ],
    "format": "In person",
    "years": [
      "Year 12"
    ],
    "subjects": [
      "Maths",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science"
    ],
    "selection": "Eligibility criteria apply",
    "activities": [
      "Supervised research project"
    ],
    "unconfirmed": [
      "Current application cycle",
      "Current duration",
      "Current programme requirements"
    ]
  },
  {
    "id": "diamond",
    "title": "Diamond school work experience week",
    "provider": "Diamond Light Source",
    "category": "Work experience",
    "type": "Work experience",
    "sector": "Science & research",
    "url": "https://www.diamond.ac.uk/Careers/Students/Schools-Work-Experience.html",
    "description": "Explore scientific and engineering projects at a national science facility; projects have their own age and subject rules.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Harwell, Oxfordshire",
    "duration": "One week",
    "eligibility": "Years 10–13, ages 14–18; individual projects may restrict year group",
    "cost": "Not stated",
    "deadline": "Not stated",
    "tags": [
      "Research",
      "Engineering",
      "Science"
    ],
    "format": "In person",
    "durationBand": "1–2 weeks",
    "minAge": 14,
    "maxAge": 18,
    "years": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ],
    "geography": "Full-time education at UK schools",
    "subjects": [
      "Physics",
      "Maths",
      "Engineering",
      "Biology",
      "Chemistry",
      "Computer Science"
    ],
    "activities": [
      "Choose a scientific, computing or engineering project"
    ]
  },
  {
    "id": "stfc",
    "title": "STFC laboratory work experience",
    "provider": "Science and Technology Facilities Council",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Science & research",
    "url": "https://www.ukri.org/who-we-are/stfc/work-for-stfc/work-experience/",
    "description": "Find laboratory placement schemes at Daresbury, Rutherford Appleton and the UK Astronomy Technology Centre.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "Warrington · Harwell · Edinburgh",
    "duration": "Not stated",
    "eligibility": "Years 10–13; each laboratory publishes its own current application details",
    "cost": "Not stated",
    "deadline": "Varies by programme",
    "tags": [
      "Research",
      "Work experience"
    ],
    "format": "In person",
    "years": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ],
    "subjects": [
      "Physics",
      "Maths",
      "Engineering",
      "Computer Science"
    ]
  },
  {
    "id": "pathways-law-online",
    "title": "Pathways to Law Online",
    "provider": "Sutton Trust",
    "category": "Widening participation",
    "type": "Widening participation",
    "sector": "Law",
    "url": "https://applicationsupport.suttontrust.com/support/solutions/articles/203000055882-what-does-the-pathways-online-programme-consist-of-",
    "description": "Explore legal careers and routes into the profession through online sessions.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online · UK",
    "duration": "Year 12 sessions; resources continue into Year 13",
    "eligibility": "First year of sixth form at a UK state school; regional year equivalents and additional criteria apply",
    "cost": "Not stated",
    "deadline": "2 November; deadline year not explicit on source",
    "tags": [
      "Widening participation",
      "Career exploration"
    ],
    "format": "Virtual",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "geography": "UK; no commuting-distance requirement",
    "durationBand": "Longer programme",
    "activities": [
      "Industry panels and university taster sessions",
      "Skills workshops"
    ],
    "sourceUrls": [
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000055882-what-does-the-pathways-online-programme-consist-of-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000052259-pathways-and-pathways-online-am-i-eligible-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000058498-when-do-pathways-applications-close-"
    ],
    "skills": [
      "Public speaking"
    ]
  },
  {
    "id": "pathways-finance-online",
    "title": "Pathways to Banking & Finance Online",
    "provider": "Sutton Trust",
    "category": "Widening participation",
    "type": "Widening participation",
    "sector": "Business & finance",
    "url": "https://applicationsupport.suttontrust.com/support/solutions/articles/203000055882-what-does-the-pathways-online-programme-consist-of-",
    "description": "Online industry insights, skills sessions and university access support in banking and finance.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online · UK",
    "duration": "Year 12 sessions; resources continue into Year 13",
    "eligibility": "First year of sixth form at a UK state school; regional year equivalents and additional criteria apply",
    "cost": "Not stated",
    "deadline": "2 November; deadline year not explicit on source",
    "tags": [
      "Widening participation",
      "Career exploration"
    ],
    "format": "Virtual",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "geography": "UK; no commuting-distance requirement",
    "durationBand": "Longer programme",
    "activities": [
      "Industry panels and university taster sessions",
      "Skills workshops"
    ],
    "sourceUrls": [
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000055882-what-does-the-pathways-online-programme-consist-of-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000052259-pathways-and-pathways-online-am-i-eligible-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000058498-when-do-pathways-applications-close-"
    ],
    "skills": [
      "Public speaking"
    ]
  },
  {
    "id": "pathways-engineering-online",
    "title": "Pathways to Engineering Online",
    "provider": "Sutton Trust",
    "category": "Widening participation",
    "type": "Widening participation",
    "sector": "Engineering",
    "url": "https://applicationsupport.suttontrust.com/support/solutions/articles/203000060277-is-there-an-online-option-for-pathways-to-engineering-",
    "description": "Explore the new online engineering pathway. Confirm its full programme content and application requirements.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online",
    "duration": "Not stated",
    "eligibility": "Not stated",
    "cost": "Not stated",
    "deadline": "2 November; deadline year not explicit on source",
    "tags": [
      "Engineering",
      "Widening participation"
    ],
    "format": "Virtual",
    "sourceUrls": [
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000060277-is-there-an-online-option-for-pathways-to-engineering-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000058498-when-do-pathways-applications-close-"
    ]
  },
  {
    "id": "pathways-finance-lse",
    "title": "Pathways to Banking & Finance at LSE",
    "provider": "Sutton Trust · London School of Economics",
    "category": "Widening participation",
    "type": "Widening participation",
    "sector": "Business & finance",
    "url": "https://pathwaysprogrammes.suttontrust.com/career-pathways/banking-finance/pathways-to-banking-finance-at-london-school-of-economics",
    "description": "Finance-related academic sessions, employer encounters and application workshops, with opportunities to apply for placements.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "London",
    "duration": "Two-year access scheme",
    "eligibility": "First year of sixth form at a UK state school; check complete criteria",
    "cost": "Not stated",
    "deadline": "19 October; deadline year not explicit on current help page",
    "tags": [
      "Banking",
      "University outreach"
    ],
    "years": [
      "Year 12",
      "Year 13"
    ],
    "durationBand": "Longer programme",
    "geography": "Live within 90 minutes of LSE; UK state-school criteria",
    "activities": [
      "Economics, accounting and finance taster sessions",
      "Meet industry professionals"
    ],
    "sourceUrls": [
      "https://pathwaysprogrammes.suttontrust.com/career-pathways/banking-finance/pathways-to-banking-finance-at-london-school-of-economics",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000058498-when-do-pathways-applications-close-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000052259-pathways-and-pathways-online-am-i-eligible-"
    ]
  },
  {
    "id": "access-apprenticeships",
    "title": "Access Apprenticeships",
    "provider": "Sutton Trust",
    "category": "Apprenticeship insight",
    "type": "Apprenticeship insight",
    "sector": "Explore careers",
    "url": "https://applicationsupport.suttontrust.com/support/solutions/articles/203000057376-what-does-the-access-apprenticeships-programme-consist-of-",
    "description": "Work experience and skills support for students exploring apprenticeships in law, finance or engineering.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "London or Manchester",
    "duration": "18 months",
    "eligibility": "Year 12; check the chosen sector/location's complete eligibility",
    "cost": "Not stated",
    "deadline": "Not stated",
    "tags": [
      "Apprenticeships",
      "Law",
      "Engineering",
      "Finance"
    ],
    "format": "Hybrid",
    "years": [
      "Year 12"
    ],
    "durationBand": "Longer programme",
    "applicationState": "Open",
    "applicationUrl": "https://suttontrust.tfaforms.net/5225546",
    "activities": [
      "Work experience and meetings with apprentices",
      "CV and skills workshops"
    ],
    "sourceUrls": [
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000057376-what-does-the-access-apprenticeships-programme-consist-of-",
      "https://applicationsupport.suttontrust.com/support/solutions/articles/203000055917-access-apprenticeships-when-do-applications-open-"
    ]
  },
  {
    "id": "chemistry-olympiad",
    "title": "UK Chemistry Olympiad 2027",
    "provider": "Royal Society of Chemistry",
    "category": "Competition",
    "type": "Competition",
    "sector": "Science & research",
    "url": "https://edu.rsc.org/enrichment/uk-chemistry-olympiad",
    "description": "Solve chemistry problems beyond the syllabus. Enter through your school or college, not individually.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Your school or college",
    "duration": "Not stated",
    "eligibility": "British Isles secondary schools and colleges; questions target the final school year. Recommended age 16+.",
    "cost": "Free",
    "deadline": "School registration closes 11 January 2027",
    "tags": [
      "Chemistry",
      "Competition"
    ],
    "format": "In person",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "subjects": [
      "Chemistry"
    ],
    "geography": "Free entry in the British Isles; international rules differ",
    "deadlineDate": "2027-01-11",
    "startDate": "2027-01-21",
    "applicationState": "Open",
    "selection": "Round-one entry through schools; top scorers selected for later rounds",
    "activities": [
      "Written chemistry problems"
    ],
    "skills": [
      "Problem solving",
      "Creative thinking"
    ],
    "certificate": "Awards and certificates subject to competition rules"
  },
  {
    "id": "biology-olympiad",
    "title": "British Biology Olympiad 2027",
    "provider": "UK Biology Competitions",
    "category": "Competition",
    "type": "Competition",
    "sector": "Science & research",
    "url": "https://ukbiologycompetitions.org/british-biology-olympiad/",
    "description": "Test biology understanding and problem solving in two school-invigilated online papers.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Your registered school or college",
    "duration": "Two 45-minute papers",
    "eligibility": "Year 12/13 England and Wales, equivalent years elsewhere. Teacher registration required.",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "Biology",
      "Competition"
    ],
    "format": "In person",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "subjects": [
      "Biology"
    ],
    "durationBand": "A few hours",
    "startDate": "2027-01-15",
    "applicationState": "Open",
    "certificate": "E-certificate for participants via school",
    "selection": "Top scorers invited to further UK team-selection activities",
    "activities": [
      "Complete two biology papers at school"
    ],
    "skills": [
      "Problem solving"
    ]
  },
  {
    "id": "ukmt-senior",
    "title": "Senior Mathematical Challenge",
    "provider": "UK Mathematics Trust",
    "category": "Competition",
    "type": "Competition",
    "sector": "Science & research",
    "url": "https://ukmt.org.uk/senior-challenges",
    "description": "A maths problem-solving challenge for students in Year 13 and below. Ask your school about entry.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Your school or college",
    "duration": "90 minutes",
    "eligibility": "Year 13 and below; school entry arrangements apply",
    "cost": "Not stated",
    "deadline": "Not stated",
    "tags": [
      "Maths",
      "Competition"
    ],
    "format": "In person",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "subjects": [
      "Maths",
      "Further Maths"
    ],
    "durationBand": "A few hours",
    "activities": [
      "25 multiple-choice mathematical problems"
    ],
    "skills": [
      "Problem solving"
    ]
  },
  {
    "id": "ukmt-team",
    "title": "Senior Team Mathematical Challenge",
    "provider": "UK Mathematics Trust",
    "category": "Competition",
    "type": "Competition",
    "sector": "Science & research",
    "url": "https://ukmt.org.uk/team-challenges/senior-team-mathematical-challenge",
    "description": "Take part in a four-student maths team through a registered UK school or college.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Regional events across the UK",
    "duration": "Not stated",
    "eligibility": "Years 12/13 or regional equivalents; no more than two older-year students per team",
    "cost": "School entry fee; check current ticket price",
    "deadline": "Not stated",
    "tags": [
      "Maths",
      "Team competition"
    ],
    "format": "In person",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "subjects": [
      "Maths",
      "Further Maths"
    ],
    "geography": "UK registered UKMT centre",
    "applicationState": "Open",
    "activities": [
      "Team mathematical challenges"
    ]
  },
  {
    "id": "beamline",
    "title": "Beamline for Schools",
    "provider": "CERN · DESY · University of Bonn",
    "category": "Competition",
    "type": "Competition",
    "sector": "Science & research",
    "url": "https://beamlineforschools.cern/",
    "description": "Propose a particle-physics experiment as a school team. Winning teams can carry out their experiment at a laboratory.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "International · selected laboratory visits",
    "duration": "Not stated",
    "eligibility": "Secondary/high-school teams; check next edition's age and supervisor rules",
    "cost": "Free",
    "deadline": "2026 finished; 2027 edition to be announced",
    "tags": [
      "Physics",
      "Research",
      "Competition"
    ],
    "format": "Hybrid",
    "minAge": 16,
    "maxAge": 19,
    "subjects": [
      "Physics",
      "Maths"
    ],
    "applicationState": "Not yet open",
    "activities": [
      "Prepare a beamline experiment proposal"
    ],
    "selection": "Scientific selection of winning proposals",
    "sourceUrls": [
      "https://beamlineforschools.cern/",
      "https://beamlineforschools.cern/terms-and-conditions"
    ]
  },
  {
    "id": "gresham",
    "title": "Gresham free public lectures",
    "provider": "Gresham College",
    "category": "Provider directory",
    "type": "Provider directory",
    "sector": "Humanities & social sciences",
    "url": "https://www.gresham.ac.uk/",
    "description": "Browse free lectures across arts and sciences. Select an individual event or recording.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Directory",
    "location": "London · online",
    "duration": "Not stated",
    "eligibility": "Check each programme's age, school year and geographic criteria",
    "cost": "Free",
    "deadline": "Varies by programme",
    "tags": [
      "Lectures",
      "Academic exploration"
    ],
    "format": "Hybrid",
    "subjects": [
      "History",
      "English",
      "Law",
      "Maths",
      "Physics",
      "Computer Science",
      "Music"
    ]
  },
  {
    "id": "gresham-history",
    "title": "What History is NOT — public lecture",
    "provider": "Gresham College · Royal Historical Society",
    "category": "Lecture / academic event",
    "type": "Lecture / academic event",
    "sector": "Humanities & social sciences",
    "url": "https://www.gresham.ac.uk/watch-now/series/royal-historical-society-lecture",
    "description": "A public lecture by Sathnam Sanghera in the Royal Historical Society series.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Check the individual event page",
    "duration": "Not stated",
    "eligibility": "Not stated",
    "cost": "Free",
    "deadline": "Not stated",
    "tags": [
      "History",
      "Lecture"
    ],
    "subjects": [
      "History"
    ],
    "startDate": "2026-11-03",
    "activities": [
      "Attend or watch a history lecture"
    ],
    "unconfirmed": [
      "Event booking availability",
      "Attendance format"
    ]
  },
  {
    "id": "deloitte-women",
    "title": "Career Shapers: Inspiring Women",
    "provider": "Deloitte",
    "category": "Employer insight",
    "type": "Employer insight",
    "sector": "Business & finance",
    "url": "https://www.deloitte.com/uk/en/careers/early-careers/early-careers-programmes.html",
    "description": "Explore professional services and apprenticeship routes. Deloitte particularly encourages women to apply.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online",
    "duration": "Two days",
    "eligibility": "Year 12 England/Wales, Year 13 NI or S5; studying towards at least 104 UCAS points from top three A levels/equivalent",
    "cost": "Not stated",
    "deadline": "Applications open 9 November 2026; closing date not stated",
    "tags": [
      "Apprenticeships",
      "Professional services"
    ],
    "format": "Virtual",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "durationBand": "1–3 days",
    "activities": [
      "Hear from Deloitte professionals",
      "Explore business areas and workplace skills"
    ],
    "startDate": "2027-02-16",
    "applicationState": "Not yet open"
  },
  {
    "id": "deloitte-black",
    "title": "Career Shapers: Inspiring Black Talent",
    "provider": "Deloitte",
    "category": "Employer insight",
    "type": "Employer insight",
    "sector": "Business & finance",
    "url": "https://www.deloitte.com/uk/en/careers/early-careers/early-careers-programmes.html",
    "description": "Explore careers in professional services. Deloitte particularly encourages applications from Black heritage backgrounds.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online",
    "duration": "Two days",
    "eligibility": "Year 12 England/Wales, Year 13 NI or S5; studying towards at least 104 UCAS points from top three A levels/equivalent",
    "cost": "Not stated",
    "deadline": "Applications open January 2027; closing date not stated",
    "tags": [
      "Apprenticeships",
      "Professional services"
    ],
    "format": "Virtual",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "durationBand": "1–3 days",
    "activities": [
      "Hear from Deloitte professionals",
      "Explore business areas and workplace skills"
    ],
    "startDate": "2027-04-07",
    "applicationState": "Not yet open"
  },
  {
    "id": "ai-futures",
    "title": "AI Futures Challenge 2027",
    "provider": "Northeastern University London",
    "category": "Career exploration",
    "type": "Career exploration",
    "sector": "Technology",
    "url": "https://www.nulondon.ac.uk/study/ai-futures/ai-futures-faq/",
    "description": "Use AI tools to address a business challenge, individually or with a team, in an online five-day programme.",
    "checkedAt": "2026-10-02",
    "addedAt": "2026-10-02",
    "source": "catalogue",
    "sourceKind": "Programme",
    "location": "Online",
    "duration": "Five days with flexible project time",
    "eligibility": "Penultimate school year, equivalent to Year 12; check current terms",
    "cost": "Free",
    "deadline": "Register interest by 7 February 2027, 8pm GMT",
    "tags": [
      "AI",
      "Technology",
      "Competition"
    ],
    "format": "Virtual",
    "years": [
      "Year 12"
    ],
    "durationBand": "4–7 days",
    "startDate": "2027-02-15",
    "deadlineDate": "2027-02-07",
    "certificate": "Certificate for students who submit a project",
    "activities": [
      "Work on an AI business challenge"
    ],
    "unconfirmed": [
      "Registration is currently accepting submissions"
    ]
  }
].map(item=>enrich(item as Partial<RichOpportunity>));
