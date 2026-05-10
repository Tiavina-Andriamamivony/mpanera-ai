"use client"

import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, MapPin } from "lucide-react"
import { useState } from "react"

export interface Project {
  id: string
  title: string
  pricePerHour: string
  status: "Paid" | "Not Paid"
  categories: string[]
  description: string
  location: string
  timeAgo: string
  logoColor: string
  logoIcon: string
}

interface ProjectCardsProps {
  projects: Project[]
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  hover: {
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
} as const

const expandedContentVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: [0.04, 0.62, 0.23, 0.98] as const,
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.4,
      ease: [0.04, 0.62, 0.23, 0.98] as const,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
} as const

const childVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
} as const

const pillVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  hover: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
  },
} as const

const logoVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
} as const

const chevronVariants = {
  hover: {
    scale: 1.1,
    backgroundColor: "#C1C7CD",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.95,
  },
} as const

function ProjectCard({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="cursor-pointer border-b border-gray-300 py-4"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start gap-4">
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            className={`h-12 w-12 ${project.logoColor} flex-shrink-0 rounded-lg text-lg font-semibold text-white shadow-sm flex items-center justify-center`}
          >
            {project.logoIcon}
          </motion.div>

          <div className="min-w-0 flex-1">
            <motion.div className="mb-2 flex items-center gap-3" variants={childVariants}>
              <h3 className="text-sm font-semibold text-gray-900">{project.title}</h3>
              <div className="h-3 w-px bg-gray-400"></div>
              <motion.span
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
                  project.status === "Paid" ? "text-gray-200 shadow-sm" : "text-gray-700"
                }`}
                style={{
                  backgroundColor: project.status === "Paid" ? "#272D41" : "#D4DADB",
                }}
              >
                {project.status}
              </motion.span>
            </motion.div>

            <motion.p className="mb-4 text-sm font-medium text-gray-600" variants={childVariants}>
              {project.pricePerHour}
            </motion.p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={expandedContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="overflow-hidden"
                >
                  <motion.div className="mb-4 flex gap-2" variants={childVariants}>
                    {project.categories.map((category, index) => (
                      <motion.span
                        key={index}
                        variants={pillVariants}
                        whileHover="hover"
                        whileTap="tap"
                        custom={index}
                        className="cursor-pointer select-none rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                        style={{ backgroundColor: "#D4DADB" }}
                      >
                        {category}
                      </motion.span>
                    ))}
                  </motion.div>

                  <motion.p
                    className="mb-4 text-sm leading-relaxed text-gray-600"
                    variants={childVariants}
                  >
                    {project.description}
                  </motion.p>

                  <motion.div
                    className="flex items-center gap-2 text-sm text-gray-500"
                    variants={childVariants}
                  >
                    <motion.div
                      whileHover={{ scale: 1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <MapPin className="h-4 w-4" />
                    </motion.div>
                    <span className="text-xs font-medium">{project.location}</span>
                    <div className="mx-1 h-3 w-px bg-gray-300"></div>
                    <span className="text-xs">{project.timeAgo}</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          variants={chevronVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#272D41] shadow-sm"
          style={{ backgroundColor: "#D5D9DD" }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  )
}

export function ProjectCards({ projects }: ProjectCardsProps) {
  return (
    <div className="mx-auto w-full max-w-[1920px] p-6">
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: index * 0.1 + 0.3,
              mass: 0.8,
            }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
