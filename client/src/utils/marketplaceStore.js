import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "freelance_marketplace_store_v2_inr";
const EVENT_NAME = "freelance_marketplace_store_change";

export const INITIAL_JOBS = [
  {
    id: 1,
    title: "Build a Full-Stack E-commerce Platform",
    client: "TechVentures India",
    clientAvatar: "TV",
    category: "Web Development",
    skills: ["React", "Node.js", "MongoDB", "Razorpay"],
    budget: "₹1,20,000 - ₹2,50,000",
    budgetType: "Fixed",
    budgetAmount: 180000,
    location: "Remote (India)",
    deadline: "2026-11-15",
    description: "We require an experienced full-stack engineer to build a high-conversion modern e-commerce storefront with Razorpay checkout, real-time inventory management, and an administrative dashboard.",
    proposals: 12,
    shortlisted: 3,
    status: "Applications Received",
    postedDate: "Oct 1, 2026",
    urgent: true,
    hiredFreelancerId: null
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design - Fitness & Health Tracker",
    client: "HealthFirst Labs",
    clientAvatar: "HF",
    category: "UI/UX Design",
    skills: ["Figma", "Adobe XD", "Prototyping", "Mobile Design"],
    budget: "₹45,000 - ₹85,000",
    budgetType: "Fixed",
    budgetAmount: 65000,
    location: "Remote",
    deadline: "2026-10-30",
    description: "Design an engaging, sleek health tracking mobile application. Scope includes user journey maps, high-fidelity wireframes, interactive Figma prototypes, and complete design system tokens for iOS and Android.",
    proposals: 8,
    shortlisted: 2,
    status: "Published",
    postedDate: "Oct 3, 2026",
    urgent: false,
    hiredFreelancerId: null
  },
  {
    id: 3,
    title: "Python Data Analysis & ML Customer Churn Predictor",
    client: "DataMinds Corp",
    clientAvatar: "DM",
    category: "Data Science",
    skills: ["Python", "TensorFlow", "Pandas", "scikit-learn"],
    budget: "₹2,500 - ₹4,500/hr",
    budgetType: "Hourly",
    budgetAmount: 150000,
    location: "Bengaluru, India",
    deadline: "2026-12-01",
    description: "Architect and train an ensemble machine learning model to predict SaaS customer churn with >90% precision. Must provide automated evaluation notebooks and a containerized FastAPI inference endpoint.",
    proposals: 5,
    shortlisted: 1,
    status: "Published",
    postedDate: "Oct 4, 2026",
    urgent: false,
    hiredFreelancerId: null
  },
  {
    id: 4,
    title: "React Native Event Management Mobile Application",
    client: "StartupHub Global",
    clientAvatar: "SH",
    category: "Mobile Development",
    skills: ["React", "TypeScript", "Firebase", "TailwindCSS"],
    budget: "₹80,000 - ₹1,60,000",
    budgetType: "Fixed",
    budgetAmount: 120000,
    location: "Remote",
    deadline: "2026-11-20",
    description: "Build a cross-platform mobile application for tech conference attendees: ticket QR check-in, live session streaming, interactive speaker schedules, and in-app attendee messaging.",
    proposals: 19,
    shortlisted: 4,
    status: "Applications Received",
    postedDate: "Sep 29, 2026",
    urgent: true,
    hiredFreelancerId: null
  },
  {
    id: 5,
    title: "Enterprise Kubernetes & AWS Cloud DevOps Pipeline",
    client: "CloudScale Systems",
    clientAvatar: "CS",
    category: "DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    budget: "₹1,80,000 - ₹3,20,000",
    budgetType: "Fixed",
    budgetAmount: 240000,
    location: "Remote",
    deadline: "2026-11-30",
    description: "Set up a zero-downtime GitOps pipeline on AWS EKS using Terraform, GitHub Actions, and ArgoCD. Must include Datadog monitoring and multi-region failover architecture.",
    proposals: 6,
    shortlisted: 2,
    status: "Published",
    postedDate: "Oct 2, 2026",
    urgent: false,
    hiredFreelancerId: null
  },
  {
    id: 6,
    title: "Brand Identity, 3D Assets & Design System",
    client: "NovaCreatives",
    clientAvatar: "NC",
    category: "Graphic Design",
    skills: ["Figma", "Adobe Illustrator", "3D Modeling", "Branding"],
    budget: "₹35,000 - ₹70,000",
    budgetType: "Fixed",
    budgetAmount: 55000,
    location: "Remote",
    deadline: "2026-10-28",
    description: "Create an iconic visual brand identity including logo guidelines, typographic hierarchy, 3D product illustrations, and web design system components.",
    proposals: 14,
    shortlisted: 3,
    status: "Freelancer Selected",
    postedDate: "Sep 25, 2026",
    urgent: false,
    hiredFreelancerId: 2
  }
];

export const INITIAL_FREELANCERS = [
  {
    id: 1,
    name: "Alex Johnson",
    title: "Senior Full-Stack Engineer & Cloud Architect",
    avatar: "AJ",
    avatarGrad: "linear-gradient(135deg, #635BFF, #8B5CF6)",
    location: "Bengaluru / Remote",
    rating: 4.95,
    reviewsCount: 87,
    completedProjects: 143,
    successRate: 99,
    experience: "6 years",
    category: "Web Development",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS", "Docker"],
    expectedPrice: "₹1,45,000",
    priceAmount: 145000,
    estimatedTimeline: "2.5 weeks",
    deliveryDays: 18,
    availability: "Available Now",
    available: true,
    verified: true,
    featured: true,
    bio: "Full-stack developer with 6+ years of production experience building high-scale SaaS web applications, e-commerce engines, and REST/GraphQL APIs. Focused on clean architecture, 100% test coverage, and smooth user experiences.",
    portfolio: [
      { id: "p1", title: "Global E-Commerce Engine", tech: "React · Node.js · Razorpay", link: "#", metric: "₹3.5 Cr+ GMV processed", color: "#635BFF" },
      { id: "p2", title: "Enterprise Analytics Hub", tech: "TypeScript · D3 · AWS", link: "#", metric: "50k daily active users", color: "#10B981" },
      { id: "p3", title: "Real-time Collaboration Canvas", tech: "WebSockets · Canvas · Redis", link: "#", metric: "99.99% uptime", color: "#F59E0B" }
    ],
    reviews: [
      { id: "r1", client: "TechVentures India", rating: 5, date: "Sep 2026", comment: "Alex exceeded every expectation. Delivered our full-stack store 4 days ahead of schedule with immaculate code quality." },
      { id: "r2", client: "FinTech Prime", rating: 5, date: "Aug 2026", comment: "Outstanding architectural knowledge, rapid problem-solving, and seamless communication throughout the sprint." },
      { id: "r3", client: "NextGen Media", rating: 4.9, date: "Jul 2026", comment: "High quality deliverables and great UI touch. Highly recommended for complex React/Node builds." }
    ],
    resumeName: "Alex_Johnson_FullStack_Resume_2026.pdf",
    resumeSize: "2.4 MB"
  },
  {
    id: 2,
    name: "Sarah Chen",
    title: "Lead UI/UX Designer & Product Strategist",
    avatar: "SC",
    avatarGrad: "linear-gradient(135deg, #EC4899, #8B5CF6)",
    location: "Mumbai / Remote",
    rating: 4.9,
    reviewsCount: 64,
    completedProjects: 98,
    successRate: 98,
    experience: "5 years",
    category: "UI/UX Design",
    skills: ["Figma", "Adobe XD", "Prototyping", "Mobile Design", "Design Systems"],
    expectedPrice: "₹65,000",
    priceAmount: 65000,
    estimatedTimeline: "2 weeks",
    deliveryDays: 14,
    availability: "Available Now",
    available: true,
    verified: true,
    featured: true,
    bio: "Ex-Google design contractor specializing in human-centered product design, conversion-focused interfaces, and comprehensive design systems. Over 90+ applications launched with top App Store ratings.",
    portfolio: [
      { id: "p4", title: "FinTech Mobile Neo-Bank", tech: "Figma · Design System · iOS", link: "#", metric: "4.8 App Store rating", color: "#EC4899" },
      { id: "p5", title: "Health & Fitness Tracker Pro", tech: "Mobile UX · Wireframes", link: "#", metric: "120k active subscribers", color: "#3B82F6" },
      { id: "p6", title: "B2B SaaS Dashboard Toolkit", tech: "Figma Tokens · Components", link: "#", metric: "Used across 14 teams", color: "#10B981" }
    ],
    reviews: [
      { id: "r4", client: "HealthFirst Labs", rating: 5, date: "Sep 2026", comment: "Sarah took our vague idea and transformed it into a world-class mobile interface. Clients love the aesthetic." },
      { id: "r5", client: "VentureSpark", rating: 4.9, date: "Aug 2026", comment: "Extremely thorough prototypes, pixel-perfect design tokens, and great understanding of user behavior." }
    ],
    resumeName: "Sarah_Chen_Senior_Product_Design.pdf",
    resumeSize: "4.1 MB"
  },
  {
    id: 3,
    name: "Raj Patel",
    title: "Senior MERN & React Native Developer",
    avatar: "RP",
    avatarGrad: "linear-gradient(135deg, #F59E0B, #EF4444)",
    location: "Ahmedabad / Remote",
    rating: 4.8,
    reviewsCount: 52,
    completedProjects: 76,
    successRate: 95,
    experience: "4 years",
    category: "Mobile Development",
    skills: ["React", "TypeScript", "Firebase", "Node.js", "MongoDB"],
    expectedPrice: "₹95,000",
    priceAmount: 95000,
    estimatedTimeline: "3 weeks",
    deliveryDays: 21,
    availability: "Available Now",
    available: true,
    verified: true,
    featured: false,
    bio: "Cross-platform mobile and web developer specializing in rapid MVP delivery, scalable APIs, and real-time features using WebSockets and Firebase.",
    portfolio: [
      { id: "p7", title: "On-Demand Delivery App", tech: "React Native · Firebase · Maps", link: "#", metric: "250k deliveries completed", color: "#F59E0B" },
      { id: "p8", title: "Event Streaming Platform", tech: "React · WebRTC · Node", link: "#", metric: "Sub-second video latency", color: "#EF4444" }
    ],
    reviews: [
      { id: "r6", client: "QuickDeliver Corp", rating: 4.8, date: "Sep 2026", comment: "Raj is dedicated, fast, and highly reliable. Handled our app release without a single critical glitch." }
    ],
    resumeName: "Raj_Patel_MERN_Developer.pdf",
    resumeSize: "1.8 MB"
  },
  {
    id: 4,
    name: "Emma Wilson",
    title: "Principal Python, AI & ML Engineer",
    avatar: "EW",
    avatarGrad: "linear-gradient(135deg, #10B981, #3B82F6)",
    location: "Hyderabad / Remote",
    rating: 4.96,
    reviewsCount: 112,
    completedProjects: 187,
    successRate: 99,
    experience: "7 years",
    category: "Data Science",
    skills: ["Python", "TensorFlow", "Pandas", "scikit-learn", "AWS", "Docker"],
    expectedPrice: "₹1,95,000",
    priceAmount: 195000,
    estimatedTimeline: "3.5 weeks",
    deliveryDays: 25,
    availability: "Busy (In Project)",
    available: false,
    verified: true,
    featured: true,
    bio: "Machine Learning scientist specializing in predictive modeling, deep learning architectures, time-series forecasting, and production ML pipelines.",
    portfolio: [
      { id: "p9", title: "Fraud Detection Engine", tech: "Python · XGBoost · FastAPI", link: "#", metric: "99.4% precision rate", color: "#10B981" },
      { id: "p10", title: "Customer Churn Prediction", tech: "TensorFlow · Docker · AWS", link: "#", metric: "Saved ₹95L annual revenue", color: "#3B82F6" }
    ],
    reviews: [
      { id: "r7", client: "DataMinds Corp", rating: 5, date: "Sep 2026", comment: "Emma is arguably one of the top ML practitioners we've ever engaged. Clean math, robust deployment." }
    ],
    resumeName: "Emma_Wilson_Staff_MLEngineer.pdf",
    resumeSize: "3.2 MB"
  },
  {
    id: 5,
    name: "Carlos Mendez",
    title: "Senior Cloud & DevOps Engineer",
    avatar: "CM",
    avatarGrad: "linear-gradient(135deg, #06B6D4, #635BFF)",
    location: "Pune / Remote",
    rating: 4.85,
    reviewsCount: 48,
    completedProjects: 65,
    successRate: 97,
    experience: "5 years",
    category: "DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    expectedPrice: "₹1,60,000",
    priceAmount: 160000,
    estimatedTimeline: "2 weeks",
    deliveryDays: 14,
    availability: "Available Now",
    available: true,
    verified: true,
    featured: false,
    bio: "AWS Certified DevOps Pro specializing in infrastructure-as-code, high-availability Kubernetes clusters, automated rollback CI/CD, and cost optimization.",
    portfolio: [
      { id: "p11", title: "Multi-Region K8s Platform", tech: "EKS · Terraform · ArgoCD", link: "#", metric: "99.995% service uptime", color: "#06B6D4" }
    ],
    reviews: [
      { id: "r8", client: "CloudScale Systems", rating: 4.9, date: "Aug 2026", comment: "Carlos cut our AWS cloud bills by 38% while improving deployment frequency from weekly to daily." }
    ],
    resumeName: "Carlos_Mendez_DevOps_Specialist.pdf",
    resumeSize: "2.1 MB"
  },
  {
    id: 6,
    name: "Elena Rostova",
    title: "3D Brand & Motion Graphics Artist",
    avatar: "ER",
    avatarGrad: "linear-gradient(135deg, #F43F5E, #FB923C)",
    location: "Delhi / Remote",
    rating: 4.78,
    reviewsCount: 39,
    completedProjects: 51,
    successRate: 94,
    experience: "4 years",
    category: "Graphic Design",
    skills: ["Figma", "Adobe Illustrator", "3D Modeling", "Branding"],
    expectedPrice: "₹55,000",
    priceAmount: 55000,
    estimatedTimeline: "1.5 weeks",
    deliveryDays: 10,
    availability: "Available Now",
    available: true,
    verified: true,
    featured: false,
    bio: "Visual artist crafting high-impact brand identities, 3D web illustrations, animated logos, and cohesive vector graphic systems for tech innovators.",
    portfolio: [
      { id: "p12", title: "Neobank 3D Asset Kit", tech: "Blender · Illustrator · SVG", link: "#", metric: "Featured on Awwwards", color: "#F43F5E" }
    ],
    reviews: [
      { id: "r9", client: "NovaCreatives", rating: 4.8, date: "Sep 2026", comment: "Sensational eye for lighting, materials, and typography. Will definitely book again." }
    ],
    resumeName: "Elena_Rostova_Visual_Portfolio.pdf",
    resumeSize: "5.6 MB"
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 1,
    jobId: 1,
    jobTitle: "Build a Full-Stack E-commerce Platform",
    freelancerId: 1,
    freelancerName: "Alex Johnson",
    freelancerTitle: "Senior Full-Stack Engineer",
    freelancerAvatar: "AJ",
    freelancerRating: 4.95,
    freelancerReviews: 87,
    freelancerExperience: "6 years",
    freelancerLocation: "Bengaluru / Remote",
    clientName: "TechVentures India",
    expectedPrice: "₹1,65,000",
    priceAmount: 165000,
    estimatedTimeline: "2.5 weeks",
    coverLetter: "I have built 4 enterprise ecommerce stores with Razorpay integration and React/Node microservices. My architecture guarantees <200ms API response time and fully responsive mobile checkout. Ready to start immediately.",
    skills: ["React", "Node.js", "MongoDB", "Razorpay"],
    status: "Shortlisted",
    appliedDate: "Oct 2, 2026",
    urgent: true
  },
  {
    id: 2,
    jobId: 1,
    jobTitle: "Build a Full-Stack E-commerce Platform",
    freelancerId: 3,
    freelancerName: "Raj Patel",
    freelancerTitle: "MERN Stack Developer",
    freelancerAvatar: "RP",
    freelancerRating: 4.8,
    freelancerReviews: 52,
    freelancerExperience: "4 years",
    freelancerLocation: "Ahmedabad / Remote",
    clientName: "TechVentures India",
    expectedPrice: "₹1,15,000",
    priceAmount: 115000,
    estimatedTimeline: "3 weeks",
    coverLetter: "Skilled MERN stack developer ready to build your ecommerce system. I can implement auth, cart, catalog, and admin panel with clean state management.",
    skills: ["React", "Node.js", "MongoDB"],
    status: "Under Review",
    appliedDate: "Oct 3, 2026",
    urgent: false
  },
  {
    id: 3,
    jobId: 2,
    jobTitle: "Mobile App UI/UX Design - Fitness & Health Tracker",
    freelancerId: 2,
    freelancerName: "Sarah Chen",
    freelancerTitle: "Lead UI/UX Designer",
    freelancerAvatar: "SC",
    freelancerRating: 4.9,
    freelancerReviews: 64,
    freelancerExperience: "5 years",
    freelancerLocation: "Mumbai / Remote",
    clientName: "HealthFirst Labs",
    expectedPrice: "₹65,000",
    priceAmount: 65000,
    estimatedTimeline: "2 weeks",
    coverLetter: "Specialized in fitness & wellness apps. I will deliver full design tokens, interactive iOS/Android prototypes, and Figma component libraries ready for developer handoff.",
    skills: ["Figma", "Adobe XD", "Prototyping", "Mobile Design"],
    status: "Applied",
    appliedDate: "Oct 4, 2026",
    urgent: false
  },
  {
    id: 4,
    jobId: 4,
    jobTitle: "React Native Event Management Mobile Application",
    freelancerId: 1,
    freelancerName: "Alex Johnson",
    freelancerTitle: "Senior Full-Stack Engineer",
    freelancerAvatar: "AJ",
    freelancerRating: 4.95,
    freelancerReviews: 87,
    freelancerExperience: "6 years",
    freelancerLocation: "Bengaluru / Remote",
    clientName: "StartupHub Global",
    expectedPrice: "₹1,20,000",
    priceAmount: 120000,
    estimatedTimeline: "3 weeks",
    coverLetter: "Experienced with React Native and Firebase real-time database. I can handle QR badge generation and push notification scheduling effortlessly.",
    skills: ["React", "TypeScript", "Firebase"],
    status: "Accepted",
    appliedDate: "Sep 30, 2026",
    urgent: true
  },
  {
    id: 5,
    jobId: 6,
    jobTitle: "Brand Identity, 3D Assets & Design System",
    freelancerId: 6,
    freelancerName: "Elena Rostova",
    freelancerTitle: "3D Brand Artist",
    freelancerAvatar: "ER",
    freelancerRating: 4.78,
    freelancerReviews: 39,
    freelancerExperience: "4 years",
    freelancerLocation: "Delhi / Remote",
    clientName: "NovaCreatives",
    expectedPrice: "₹55,000",
    priceAmount: 55000,
    estimatedTimeline: "1.5 weeks",
    coverLetter: "My portfolio includes 3D graphic suites for startups. I will design custom vector logo variations and render 5 3D promotional illustrations.",
    skills: ["Figma", "Adobe Illustrator", "3D Modeling", "Branding"],
    status: "Rejected",
    appliedDate: "Sep 26, 2026",
    urgent: false
  }
];

export const INITIAL_ACTIVE_PROJECTS = [
  {
    id: 1,
    title: "React Native Event Management Mobile Application",
    client: "StartupHub Global",
    clientAvatar: "SH",
    freelancerId: 1,
    freelancerName: "Alex Johnson",
    budget: "₹1,20,000",
    deadline: "Nov 20, 2026",
    daysLeft: 22,
    progress: 45,
    status: "In Progress",
    milestone: "Phase 2: QR Scanner & Attendee Chat"
  },
  {
    id: 2,
    title: "Global E-Commerce Microservices Architecture",
    client: "TechVentures India",
    clientAvatar: "TV",
    freelancerId: 1,
    freelancerName: "Alex Johnson",
    budget: "₹2,40,000",
    deadline: "Oct 28, 2026",
    daysLeft: 12,
    progress: 75,
    status: "In Progress",
    milestone: "Phase 3: Razorpay Checkout & Webhook Validation"
  }
];

export const INITIAL_COMPLETED_PROJECTS = [
  {
    id: 1,
    title: "SaaS Analytics & Billing Platform",
    client: "FinTech Prime",
    clientAvatar: "FP",
    freelancerId: 1,
    amount: "₹3,15,000",
    completedDate: "Sep 2026",
    rating: 5,
    review: "Alex built an extraordinary billing engine with zero bugs. Truly top tier engineering."
  },
  {
    id: 2,
    title: "Healthcare Provider Scheduling System",
    client: "HealthFirst Labs",
    clientAvatar: "HF",
    freelancerId: 1,
    amount: "₹1,85,000",
    completedDate: "Aug 2026",
    rating: 5,
    review: "Impressed by the speed and responsiveness. Clean code that our internal team could easily maintain."
  },
  {
    id: 3,
    title: "NextGen Media Content Portal",
    client: "NextGen Media",
    clientAvatar: "NM",
    freelancerId: 1,
    amount: "₹1,40,000",
    completedDate: "Jul 2026",
    rating: 4.9,
    review: "Beautiful React architecture and blazing fast page loads."
  }
];

export const INITIAL_WORK_REQUESTS = [
  {
    id: 1,
    freelancerId: 1,
    freelancerName: "Alex Johnson",
    jobTitle: "Build a Full-Stack E-commerce Platform",
    clientName: "TechVentures India",
    budget: "₹1,65,000",
    timeline: "2.5 weeks",
    startDate: "2026-10-15",
    message: "Hi Alex, we were extremely impressed with your portfolio. We'd love you to lead the engineering for our e-commerce platform.",
    status: "Pending Response",
    sentDate: "Oct 5, 2026"
  }
];

export const INITIAL_NOTIFICATIONS = {
  freelancer: [
    { id: 1, title: "Shortlisted!", message: "TechVentures India shortlisted your proposal for 'Build a Full-Stack E-commerce Platform'", time: "2 hours ago", read: false, icon: "⭐" },
    { id: 2, title: "Offer Accepted", message: "StartupHub Global accepted your application for 'React Native Event Management Mobile Application'", time: "5 hours ago", read: false, icon: "🎉" },
    { id: 3, title: "Milestone Paid", message: "Payment of ₹1,20,000 released for Phase 1 of 'Global E-Commerce Microservices Architecture'", time: "1 day ago", read: true, icon: "💰" },
    { id: 4, title: "New Job Match", message: "A new job matching your React & Node.js skills was just posted by TechVentures India.", time: "2 days ago", read: true, icon: "⚡" }
  ],
  client: [
    { id: 1, title: "New Application", message: "Alex Johnson applied to your job 'Build a Full-Stack E-commerce Platform'", time: "1 hour ago", read: false, icon: "📥" },
    { id: 2, title: "Application Under Review", message: "Raj Patel submitted a proposal of ₹1,15,000 for 'Build a Full-Stack E-commerce Platform'", time: "4 hours ago", read: false, icon: "📋" },
    { id: 3, title: "Job Published", message: "Your job 'Python Data Analysis & ML Customer Churn Predictor' is now live", time: "1 day ago", read: true, icon: "🚀" }
  ]
};

// Retrieve store state from LocalStorage or seed defaults
export function getStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.jobs)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading marketplace store from localStorage", err);
  }
  return {
    jobs: INITIAL_JOBS,
    freelancers: INITIAL_FREELANCERS,
    applications: INITIAL_APPLICATIONS,
    activeProjects: INITIAL_ACTIVE_PROJECTS,
    completedProjects: INITIAL_COMPLETED_PROJECTS,
    workRequests: INITIAL_WORK_REQUESTS,
    notifications: INITIAL_NOTIFICATIONS,
    shortlistedFreelancerIds: [1, 2],
    activeJobIdForMatching: 1
  };
}

// Persist store state and broadcast event
export function saveStoredData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch (err) {
    console.error("Error saving marketplace store to localStorage", err);
  }
}

// React Hook for real-time reactivity across all components and tabs
export function useMarketplaceStore() {
  const [store, setStoreState] = useState(getStoredData);

  useEffect(() => {
    const handleStoreChange = (e) => {
      if (e.detail) {
        setStoreState(e.detail);
      } else {
        setStoreState(getStoredData());
      }
    };
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY) {
        setStoreState(getStoredData());
      }
    };

    window.addEventListener(EVENT_NAME, handleStoreChange);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener(EVENT_NAME, handleStoreChange);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  // Action: Client posts a new job
  const postJob = useCallback((jobInput) => {
    const current = getStoredData();
    const newId = Date.now();
    const budgetStr = String(jobInput.budget || "");
    const formattedBudget = budgetStr.startsWith("₹") ? budgetStr : `₹${budgetStr}`;

    const newJob = {
      id: newId,
      title: jobInput.title || "Untitled Project",
      client: jobInput.client || "TechVentures India",
      clientAvatar: "TV",
      category: jobInput.category || "Web Development",
      skills: Array.isArray(jobInput.skills) ? jobInput.skills : ["React"],
      budget: formattedBudget || "₹80,000 - ₹1,50,000",
      budgetType: jobInput.budgetType || "Fixed",
      budgetAmount: parseInt((jobInput.budget || "").replace(/\D/g, "")) || 100000,
      location: jobInput.location || "Remote",
      deadline: jobInput.deadline || "2026-11-30",
      description: jobInput.desc || jobInput.description || "Project details specified by client.",
      proposals: 0,
      shortlisted: 0,
      status: "Published",
      postedDate: "Just now",
      urgent: Boolean(jobInput.urgent),
      hiredFreelancerId: null
    };

    const updatedJobs = [newJob, ...current.jobs];
    const updatedClientNotifs = [
      { id: Date.now(), title: "Job Published", message: `Your project "${newJob.title}" is now active in the talent marketplace!`, time: "Just now", read: false, icon: "🚀" },
      ...current.notifications.client
    ];
    const updatedFreelancerNotifs = [
      { id: Date.now() + 1, title: "New Job Opportunity", message: `TechVentures India posted a new ${newJob.category} project: "${newJob.title}"`, time: "Just now", read: false, icon: "⚡" },
      ...current.notifications.freelancer
    ];

    const nextState = {
      ...current,
      jobs: updatedJobs,
      activeJobIdForMatching: newId,
      notifications: {
        client: updatedClientNotifs,
        freelancer: updatedFreelancerNotifs
      }
    };
    saveStoredData(nextState);
    return newJob;
  }, []);

  // Action: Freelancer submits a proposal/application
  const submitApplication = useCallback((appInput) => {
    const current = getStoredData();
    const newAppId = Date.now();
    const targetJob = current.jobs.find(j => j.id === appInput.jobId) || current.jobs[0];
    const priceStr = String(appInput.expectedPrice || "");
    const formattedPrice = priceStr.startsWith("₹") ? priceStr : `₹${priceStr}`;

    const newApp = {
      id: newAppId,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      freelancerId: appInput.freelancerId || 1,
      freelancerName: appInput.freelancerName || "Alex Johnson",
      freelancerTitle: appInput.freelancerTitle || "Senior Full-Stack Engineer",
      freelancerAvatar: appInput.freelancerAvatar || "AJ",
      freelancerRating: 4.95,
      freelancerReviews: 87,
      freelancerExperience: "6 years",
      freelancerLocation: "Bengaluru / Remote",
      clientName: targetJob.client,
      expectedPrice: formattedPrice,
      priceAmount: parseInt(String(appInput.expectedPrice).replace(/\D/g, "")) || 145000,
      estimatedTimeline: appInput.estimatedTimeline || "2 weeks",
      coverLetter: appInput.coverLetter || "Experienced professional ready to execute with quality standards.",
      skills: targetJob.skills || ["React"],
      status: "Applied",
      appliedDate: "Just now",
      urgent: Boolean(targetJob.urgent)
    };

    // Update job applicant count and status
    const updatedJobs = current.jobs.map(j => {
      if (j.id === targetJob.id) {
        return {
          ...j,
          proposals: (j.proposals || 0) + 1,
          status: j.status === "Published" ? "Applications Received" : j.status
        };
      }
      return j;
    });

    const updatedApplications = [newApp, ...current.applications];

    // Notifications
    const updatedClientNotifs = [
      { id: Date.now(), title: "New Application", message: `${newApp.freelancerName} submitted a proposal for "${targetJob.title}" (${newApp.expectedPrice})`, time: "Just now", read: false, icon: "📥" },
      ...current.notifications.client
    ];

    const nextState = {
      ...current,
      jobs: updatedJobs,
      applications: updatedApplications,
      notifications: {
        ...current.notifications,
        client: updatedClientNotifs
      }
    };
    saveStoredData(nextState);
    return newApp;
  }, []);

  // Action: Client/Owner changes application status (Shortlisted, Accepted, Rejected, Under Review)
  const updateApplicationStatus = useCallback((appId, newStatus) => {
    const current = getStoredData();
    let affectedApp = null;

    const updatedApplications = current.applications.map(a => {
      if (a.id === appId) {
        affectedApp = { ...a, status: newStatus };
        return affectedApp;
      }
      return a;
    });

    if (!affectedApp) return;

    let updatedJobs = [...current.jobs];
    let updatedActiveProjects = [...current.activeProjects];

    if (newStatus === "Accepted") {
      // Advance job to Freelancer Selected / In Progress
      updatedJobs = updatedJobs.map(j => {
        if (j.id === affectedApp.jobId) {
          return {
            ...j,
            status: "Freelancer Selected",
            hiredFreelancerId: affectedApp.freelancerId
          };
        }
        return j;
      });

      // Add to Active Projects
      const newProj = {
        id: Date.now(),
        title: affectedApp.jobTitle,
        client: affectedApp.clientName,
        clientAvatar: "TV",
        freelancerId: affectedApp.freelancerId,
        freelancerName: affectedApp.freelancerName,
        budget: affectedApp.expectedPrice,
        deadline: "Nov 30, 2026",
        daysLeft: 30,
        progress: 10,
        status: "In Progress",
        milestone: "Sprint 1: Architecture & Design Setup"
      };
      updatedActiveProjects = [newProj, ...updatedActiveProjects];
    } else if (newStatus === "Shortlisted") {
      updatedJobs = updatedJobs.map(j => {
        if (j.id === affectedApp.jobId) {
          return { ...j, shortlisted: (j.shortlisted || 0) + 1 };
        }
        return j;
      });
    }

    const updatedFreelancerNotifs = [
      {
        id: Date.now(),
        title: `Status: ${newStatus}`,
        message: `${affectedApp.clientName} updated your application for "${affectedApp.jobTitle}" to ${newStatus}`,
        time: "Just now",
        read: false,
        icon: newStatus === "Accepted" ? "🎉" : newStatus === "Shortlisted" ? "⭐" : "📋"
      },
      ...current.notifications.freelancer
    ];

    const nextState = {
      ...current,
      applications: updatedApplications,
      jobs: updatedJobs,
      activeProjects: updatedActiveProjects,
      notifications: {
        ...current.notifications,
        freelancer: updatedFreelancerNotifs
      }
    };
    saveStoredData(nextState);
  }, []);

  // Action: Client/Recruiter sends a direct Work Request from Selection Dashboard
  const sendWorkRequest = useCallback((reqInput) => {
    const current = getStoredData();
    const newId = Date.now();
    const fl = current.freelancers.find(f => f.id === reqInput.freelancerId) || current.freelancers[0];
    const job = current.jobs.find(j => j.id === reqInput.jobId) || current.jobs[0];

    const newRequest = {
      id: newId,
      freelancerId: fl.id,
      freelancerName: fl.name,
      jobId: job.id,
      jobTitle: job.title,
      clientName: "TechVentures India",
      budget: reqInput.budget || fl.expectedPrice,
      timeline: reqInput.timeline || fl.estimatedTimeline,
      startDate: reqInput.startDate || "2026-10-20",
      message: reqInput.message || `We would like to hire you directly for ${job.title}.`,
      status: "Request Sent",
      sentDate: "Just now"
    };

    const updatedRequests = [newRequest, ...current.workRequests];

    const updatedFreelancerNotifs = [
      { id: Date.now(), title: "Direct Work Request!", message: `TechVentures India sent you a direct work request for "${job.title}" (${newRequest.budget})`, time: "Just now", read: false, icon: "🎯" },
      ...current.notifications.freelancer
    ];

    const nextState = {
      ...current,
      workRequests: updatedRequests,
      notifications: {
        ...current.notifications,
        freelancer: updatedFreelancerNotifs
      }
    };
    saveStoredData(nextState);
    return newRequest;
  }, []);

  // Action: Toggle shortlist candidate
  const toggleShortlistFreelancer = useCallback((flId) => {
    const current = getStoredData();
    const exists = current.shortlistedFreelancerIds.includes(flId);
    const updated = exists
      ? current.shortlistedFreelancerIds.filter(id => id !== flId)
      : [...current.shortlistedFreelancerIds, flId];

    const nextState = {
      ...current,
      shortlistedFreelancerIds: updated
    };
    saveStoredData(nextState);
  }, []);

  // Action: Change active job for talent matching
  const setActiveJobForMatching = useCallback((jobId) => {
    const current = getStoredData();
    const nextState = {
      ...current,
      activeJobIdForMatching: jobId
    };
    saveStoredData(nextState);
  }, []);

  // Action: Mark notifications read
  const markNotificationsRead = useCallback((role) => {
    const current = getStoredData();
    const updated = {
      ...current.notifications,
      [role]: (current.notifications[role] || []).map(n => ({ ...n, read: true }))
    };
    saveStoredData({ ...current, notifications: updated });
  }, []);

  // Action: Reset all demo data to default clean slate
  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = getStoredData();
    saveStoredData(fresh);
    return fresh;
  }, []);

  return {
    jobs: store.jobs,
    freelancers: store.freelancers,
    applications: store.applications,
    activeProjects: store.activeProjects,
    completedProjects: store.completedProjects,
    workRequests: store.workRequests,
    notifications: store.notifications,
    shortlistedFreelancerIds: store.shortlistedFreelancerIds,
    activeJobIdForMatching: store.activeJobIdForMatching,
    postJob,
    submitApplication,
    updateApplicationStatus,
    sendWorkRequest,
    toggleShortlistFreelancer,
    setActiveJobForMatching,
    markNotificationsRead,
    resetToDefaults
  };
}
