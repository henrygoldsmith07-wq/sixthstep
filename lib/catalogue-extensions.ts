import { enrich, type RichOpportunity } from "./domain";
// Primary provider sources reviewed 3 October 2026. Full dates are stored only when stated.
const entries=[
  {
    "id": "bristol-access",
    "title": "Access to Bristol",
    "provider": "University of Bristol",
    "sector": "Explore careers",
    "category": "University outreach",
    "url": "https://www.bristol.ac.uk/study/outreach/post-16/access/",
    "description": "Subject sessions and study support for local students considering university.",
    "years": [
      "Year 12",
      "Year 13"
    ],
    "format": "Hybrid",
    "location": "Bristol",
    "eligibility": "Home fee status, state school or college and local postcode within an hour; subject-specific academic requirements apply.",
    "geography": "BA, BS or other eligible local postcode, including south Wales; check travel rule.",
    "wideningParticipation": "Additional priority criteria apply to oversubscribed streams; see provider.",
    "applicationRequirements": [
      "School or college permission",
      "Named school contact"
    ],
    "openingPeriod": "Next applications: September 2027",
    "applicationState": "Not yet open",
    "deadline": "2026–27 applications closed; next cycle September 2027",
    "durationBand": "Several weeks",
    "duration": "Online study session and five campus sessions per term"
  },
  {
    "id": "bristol-insight",
    "title": "Insight into Bristol summer school",
    "provider": "University of Bristol",
    "sector": "Explore careers",
    "category": "Summer school",
    "url": "https://www.bristol.ac.uk/study/outreach/post-16/insight/",
    "description": "Residential subject exploration; the page offers interest registration for 2026–27 while retaining earlier cohort criteria.",
    "years": [
      "Year 12"
    ],
    "format": "In person",
    "location": "Bristol",
    "cost": "Free",
    "eligibility": "Year 12 students of colour; home fee, state school, academic and other conditions. Confirm the current cohort rules.",
    "wideningParticipation": "Ethnicity and other access criteria apply; review the complete current rules.",
    "duration": "Summer school; exact next dates not confirmed",
    "unconfirmed": [
      "Current cohort eligibility",
      "2027 dates",
      "Application window"
    ]
  },
  {
    "id": "bristol-virtual",
    "title": "Bristol Virtual Summer School",
    "provider": "University of Bristol",
    "sector": "Explore careers",
    "category": "Summer school",
    "url": "https://www.bristol.ac.uk/study/outreach/post-16/virtual-summer-school/",
    "description": "Online academic talks, social sessions and university guidance. The provider offers interest registration for 2027.",
    "years": [
      "Year 12"
    ],
    "format": "Virtual",
    "location": "Online",
    "duration": "Three days in the published programme",
    "durationBand": "1–3 days",
    "eligibility": "Year 12 or equivalent; home fee, state-school and subject requirements. Recheck 2027 age and cohort rules.",
    "wideningParticipation": "Priority criteria listed by the university; full rules apply.",
    "openingPeriod": "Early 2027",
    "applicationState": "Not yet open",
    "deadline": "2026 applications closed; 2027 opening expected early 2027",
    "unconfirmed": [
      "2027 event dates",
      "Updated cohort criteria"
    ]
  },
  {
    "id": "bristol-stem-experience",
    "title": "Bristol Year 12 STEM work experience",
    "provider": "University of Bristol",
    "sector": "Science & research",
    "category": "Work experience",
    "url": "https://www.bristol.ac.uk/study/outreach/post-16/work-experience-year-12/",
    "description": "STEM placements with published biology, biochemistry and neuroscience examples from 2026. Register interest for the next programme.",
    "years": [
      "Year 12"
    ],
    "format": "In person",
    "location": "Bristol",
    "subjects": [
      "Biology",
      "Chemistry"
    ],
    "careerAreas": [
      "Science & research",
      "Medicine"
    ],
    "eligibility": "Year 12 / FE students; limited places and access priorities. Check the new cycle's complete criteria.",
    "wideningParticipation": "Priority given to widening-participation backgrounds; full criteria on provider.",
    "openingPeriod": "October 2026",
    "applicationState": "Unknown",
    "deadline": "2026 applications closed; 2027 applications expected October 2026",
    "duration": "Published placements run for a week; next dates not confirmed",
    "durationBand": "4–7 days",
    "unconfirmed": [
      "Exact 2027 opening date",
      "2027 placement availability",
      "2027 event dates"
    ]
  },
  {
    "id": "bristol-next-step",
    "title": "Next Step Bristol",
    "provider": "University of Bristol",
    "sector": "Explore careers",
    "category": "Widening participation",
    "url": "https://www.bristol.ac.uk/study/outreach/post-16/nextstep/",
    "description": "University preparation through virtual events for final-year students from Asian or Black backgrounds.",
    "years": [
      "Year 13"
    ],
    "format": "Hybrid",
    "location": "Bristol · online",
    "eligibility": "Final year of A-level or equivalent, Asian or Black backgrounds and other published criteria; check current cohort.",
    "wideningParticipation": "Ethnicity, state-school, home fee and other conditions apply.",
    "durationBand": "Longer programme",
    "duration": "Programme across the school year",
    "applicationState": "Unknown",
    "deadline": "Page contains conflicting open/closed 2026–27 statements; ask the provider",
    "unconfirmed": [
      "Application state: conflicting source statements",
      "Next cohort dates"
    ]
  },
  {
    "id": "manchester-access",
    "title": "Manchester Access Programme",
    "provider": "University of Manchester",
    "sector": "Explore careers",
    "category": "Widening participation",
    "url": "https://www.manchester.ac.uk/study/undergraduate/widening-participation/map/index.htm",
    "description": "Online and campus university preparation with an academic assignment for eligible local students.",
    "years": [
      "Year 12"
    ],
    "format": "Hybrid",
    "location": "Greater Manchester",
    "eligibility": "Local Year 12 students meeting the programme's complete access and academic criteria.",
    "geography": "Greater Manchester",
    "wideningParticipation": "Specific widening-participation criteria apply; check all conditions.",
    "openingPeriod": "November 2026 for 2027 intake",
    "applicationState": "Not yet open",
    "deadline": "Applications expected to open November 2026",
    "durationBand": "Longer programme",
    "duration": "Sustained programme; check current timetable",
    "activities": [
      "Events and workshops",
      "Academic assignment"
    ]
  },
  {
    "id": "bebras",
    "title": "UK Bebras computational thinking challenge",
    "provider": "Raspberry Pi Foundation",
    "sector": "Technology",
    "category": "Competition",
    "url": "https://www.bebras.uk/",
    "description": "An online problem-solving challenge arranged through a teacher, with a separate home-education registration route.",
    "minAge": 6,
    "maxAge": 19,
    "format": "Virtual",
    "location": "Online · teacher supervised",
    "subjects": [
      "Computer Science",
      "Maths"
    ],
    "eligibility": "UK young people aged 6–19; teacher registration or the published home-education route.",
    "geography": "Check UK and international participation rules",
    "cost": "Free",
    "duration": "45 minutes",
    "durationBand": "A few hours",
    "applicationRequirements": [
      "Teacher or home-education registration"
    ],
    "activities": [
      "Interactive computational thinking tasks"
    ]
  },
  {
    "id": "nhs-cadets",
    "title": "NHS Cadets advanced pathway",
    "provider": "NHS England · St John Ambulance",
    "sector": "Healthcare",
    "category": "Volunteering",
    "url": "https://www.england.nhs.uk/ourwork/nhs-cadets-youth-volunteering-programme/",
    "description": "A youth programme exploring health volunteering; availability depends on the local group.",
    "minAge": 16,
    "maxAge": 18,
    "eligibility": "Advanced pathway for ages 16–18; check local access and availability.",
    "wideningParticipation": "Programme aims to reach young people facing barriers to health volunteering.",
    "location": "Local groups · check availability",
    "careerAreas": [
      "Medicine",
      "Healthcare"
    ],
    "sourceUrls": [
      "https://www.england.nhs.uk/ourwork/nhs-cadets-youth-volunteering-programme/",
      "https://www.sja.org.uk/get-involved/young-people/cadets/"
    ],
    "unconfirmed": [
      "Local group availability",
      "Programme dates",
      "Delivery format"
    ]
  },
  {
    "id": "stjohn-cadets",
    "title": "St John Ambulance Cadets",
    "provider": "St John Ambulance",
    "sector": "Healthcare",
    "category": "Volunteering",
    "url": "https://www.sja.org.uk/get-involved/young-people/cadets/",
    "description": "Join a local youth group to explore first aid and volunteering. Check the available roles with the provider.",
    "minAge": 11,
    "maxAge": 17,
    "eligibility": "Cadets ages 11–17; role-specific rules and local availability apply.",
    "location": "Local groups across the UK",
    "careerAreas": [
      "Medicine",
      "Healthcare"
    ],
    "unconfirmed": [
      "Local group vacancies",
      "Meeting dates",
      "Cost"
    ]
  },
  {
    "id": "isaac-science",
    "title": "Isaac Science learning and mentoring",
    "provider": "University of Cambridge · Isaac Science",
    "sector": "Science & research",
    "category": "Provider directory",
    "url": "https://isaacscience.org/support/tutor/assignments",
    "description": "Science problem-solving resources with links to live events and a student mentoring scheme; choose the appropriate route.",
    "subjects": [
      "Physics",
      "Chemistry",
      "Maths"
    ],
    "format": "Virtual",
    "location": "Online",
    "eligibility": "Check each event or mentoring route's current eligibility.",
    "unconfirmed": [
      "Mentoring application window",
      "Mentoring age and year criteria"
    ],
    "sourceKind": "Directory"
  },
  {
    "id": "oxford-outreach",
    "title": "Oxford outreach events",
    "provider": "University of Oxford",
    "sector": "Explore careers",
    "url": "https://www.ox.ac.uk/admissions/undergraduate/access-oxford/outreach-events",
    "description": "Subject tasters, enrichment and university events; choose a dated individual event.",
    "location": "Oxford · check each event",
    "tags": [
      "University outreach"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "imperial-summer-directory",
    "title": "Imperial summer programmes",
    "provider": "Imperial College London",
    "sector": "Science & research",
    "url": "https://www.imperial.ac.uk/be-inspired/schools-outreach/secondary-schools/summer-schools/",
    "description": "STEM summer programmes for eligible school students; criteria differ by programme.",
    "location": "London",
    "tags": [
      "Summer school",
      "STEM",
      "Physics",
      "Chemistry",
      "Biology"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "smallpeice-directory",
    "title": "Smallpeice engineering courses",
    "provider": "The Smallpeice Trust",
    "sector": "Engineering",
    "url": "https://www.smallpeicetrust.org.uk/courses/",
    "description": "Browse virtual and residential engineering courses. Ages, costs and funded places depend on the course.",
    "location": "UK · virtual and residential",
    "tags": [
      "Engineering",
      "Residential",
      "Robotics"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "ri-masterclasses",
    "title": "Royal Institution masterclasses",
    "provider": "Royal Institution",
    "sector": "Science & research",
    "url": "https://www.rigb.org/attending-masterclasses-ri",
    "description": "Explore mathematics and computing workshops; check the age band and local series.",
    "location": "Local series · check provider",
    "tags": [
      "Maths",
      "Computer Science",
      "Masterclass"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "crest-projects",
    "title": "CREST STEM project resources",
    "provider": "British Science Association",
    "sector": "Science & research",
    "url": "https://www.crestawards.org/help-centre/getting-started/",
    "description": "Choose a research project and award level. Submission, assessment and fees depend on the level.",
    "location": "Independent project · check route",
    "tags": [
      "Research",
      "Biology",
      "Chemistry",
      "Physics",
      "Engineering"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "nhs-volunteering-directory",
    "title": "NHS volunteering opportunities",
    "provider": "NHS England",
    "sector": "Healthcare",
    "url": "https://www.england.nhs.uk/get-involved/get-involved/volunteering/",
    "description": "Find a local volunteering role through the NHS volunteering service; minimum ages vary by role.",
    "location": "Local NHS organisations",
    "tags": [
      "Volunteering",
      "Medicine",
      "Healthcare"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "royal-voluntary-directory",
    "title": "Royal Voluntary Service roles",
    "provider": "Royal Voluntary Service",
    "sector": "Healthcare",
    "url": "https://www.royalvoluntaryservice.org.uk/volunteering/",
    "description": "Browse community and health volunteering. Individual roles can have different age requirements.",
    "location": "Local communities",
    "tags": [
      "Volunteering",
      "Community"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "southampton-outreach",
    "title": "Southampton school and college outreach",
    "provider": "University of Southampton",
    "sector": "Explore careers",
    "url": "https://www.southampton.ac.uk/schools-colleges/faculty-outreach",
    "description": "Browse faculty activities in sciences, engineering, humanities and languages; check each event.",
    "location": "Southampton",
    "tags": [
      "University outreach",
      "Engineering",
      "Physics",
      "Languages"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "airbus-apprenticeships",
    "title": "Airbus UK apprenticeship vacancies",
    "provider": "Airbus",
    "sector": "Engineering",
    "url": "https://www.airbus.com/en/careers/students-and-graduates/apprentices/apprenticeships-in-the-united-kingdom",
    "description": "Explore technical and degree apprenticeship routes. Individual vacancies set qualifications, dates and locations.",
    "location": "UK sites · check vacancy",
    "tags": [
      "Degree apprenticeship",
      "Engineering",
      "Computer Science",
      "Technology"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  },
  {
    "id": "bristol-outreach-directory",
    "title": "Bristol post-16 outreach",
    "provider": "University of Bristol",
    "sector": "Explore careers",
    "url": "https://www.bristol.ac.uk/university/for-bristol/schools-and-young-people/",
    "description": "Browse university outreach, school visits and work-experience routes; individual programmes have their own criteria.",
    "location": "Bristol",
    "tags": [
      "University outreach",
      "Work experience"
    ],
    "category": "Provider directory",
    "sourceKind": "Directory",
    "eligibility": "Check the individual programme or role; directory coverage does not establish your eligibility.",
    "deadline": "Varies by programme",
    "unconfirmed": [
      "Individual eligibility",
      "Individual application and event dates",
      "Individual cost and delivery format"
    ]
  }
];
export const extendedCatalogue:RichOpportunity[]=entries.map(item=>enrich({source:"catalogue",checkedAt:"2026-10-03",addedAt:"2026-10-03",type:item.category,...item} as Partial<RichOpportunity>));
