import React from 'react'
import { Shield, Settings, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../ui/Button'
import './Onboarding.css'

interface OnboardingProps {
  onRecheck: () => void
  isChecking: boolean
}

const steps = [
  {
    number: 1,
    icon: Settings,
    title: 'Open System Settings',
    description: 'Go to System Settings → Privacy & Security → Full Disk Access'
  },
  {
    number: 2,
    icon: Shield,
    title: 'Add OpenCleaner',
    description: 'Click the + button and add OpenCleaner to the list'
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: 'Enable Access',
    description: 'Make sure the checkbox next to OpenCleaner is enabled'
  }
]

export function Onboarding({ onRecheck, isChecking }: OnboardingProps) {
  return (
    <div className="onboarding">
      <motion.div
        className="onboarding__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="onboarding__header">
          <motion.div
            className="onboarding__icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Shield size={64} />
          </motion.div>
          <h1 className="onboarding__title">Welcome to OpenCleaner</h1>
          <p className="onboarding__subtitle">
            OpenCleaner needs Full Disk Access to scan and remove applications and their related
            files.
          </p>
        </div>

        {/* Steps */}
        <motion.div
          className="onboarding__steps"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
              }
            }
          }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                className="onboarding__step"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <div className="onboarding__step-number">
                  <Icon size={20} />
                </div>
                <div className="onboarding__step-content">
                  <h3 className="onboarding__step-title">{step.title}</h3>
                  <p className="onboarding__step-description">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="onboarding__actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onRecheck}
            isLoading={isChecking}
            leftIcon={<CheckCircle2 size={20} />}
          >
            {isChecking ? 'Checking Permissions...' : 'Check Permissions'}
          </Button>
        </motion.div>

        {/* Info */}
        <motion.div
          className="onboarding__info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="onboarding__info-header">
            <AlertCircle size={20} />
            <h4>Why do we need this?</h4>
          </div>
          <p>
            Full Disk Access allows OpenCleaner to find and remove application support files,
            caches, preferences, and other related data stored in protected system locations.
          </p>
          <p className="onboarding__info-note">
            Your privacy is important. OpenCleaner only accesses files related to the applications
            you choose to uninstall.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
