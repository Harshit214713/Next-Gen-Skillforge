'use client';

import { useRef } from 'react';
import axios from 'axios';
import { Upload, ExternalLink, BookOpen, Github, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SocialLinks } from '@/lib/types';

interface LinkField {
  key: keyof SocialLinks;
  label: string;
  icon: React.ReactNode;
}

const LINK_FIELDS: LinkField[] = [
  { key: 'github', label: 'GitHub', icon: <Github className="h-4 w-4" /> },
  { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" /> },
  { key: 'portfolio', label: 'Portfolio', icon: <ExternalLink className="h-4 w-4" /> },
  { key: 'twitter', label: 'X / Twitter', icon: <ExternalLink className="h-4 w-4" /> },
  { key: 'devto', label: 'Dev.to', icon: <ExternalLink className="h-4 w-4" /> },
  { key: 'resume', label: 'Resume URL', icon: <BookOpen className="h-4 w-4" /> },
];

interface LinkInputsProps {
  links: SocialLinks;
  onLinkChange: (field: keyof SocialLinks, value: string) => void;
  linkErrors: Record<string, string>;
  resumeFileName: string;
  uploadingResume: boolean;
  onResumeFile: (file: File) => void;
  analyzing: boolean;
  onAnalyze: () => void;
  onDownloadReport: () => void;
  downloadingReport: boolean;
  hasCompletedAnalysis: boolean;
}

export function LinkInputs({
  links,
  onLinkChange,
  linkErrors,
  resumeFileName,
  uploadingResume,
  onResumeFile,
  analyzing,
  onAnalyze,
  onDownloadReport,
  downloadingReport,
  hasCompletedAnalysis,
}: LinkInputsProps) {
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleResumeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onResumeFile(file);
    }
    event.currentTarget.value = '';
  };

  return (
    <Card padded={false}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
            <UserCircleIcon />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">Profile Links</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Add public URLs to analyze your skills
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {LINK_FIELDS.map((field) => {
            const isResume = field.key === 'resume';
            const error = linkErrors[field.key];
            const showUpload = field.key === 'resume';
            return (
              <div
                key={field.key}
                className="flex flex-col gap-2"
              >
                {showUpload ? (
                  <div className="flex items-stretch gap-2">
                    <span className="relative block flex-1">
                      <Input
                        id={field.key}
                        value={links[field.key]}
                        onChange={(e) => onLinkChange(field.key, e.target.value)}
                        placeholder={`https://...`}
                        leftIcon={field.icon}
                        error={error}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => resumeFileInputRef.current?.click()}
                        disabled={uploadingResume}
                        className={cnBtn(
                          'absolute right-1 top-1/2 -translate-y-1/2 flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
                          uploadingResume
                            ? 'border-accent/40 bg-accent/10 text-accent'
                            : 'border-input bg-background text-muted-foreground hover:border-accent hover:text-accent'
                        )}
                        aria-label="Import resume"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingResume ? 'Importing...' : 'Import'}
                      </button>
                      <input
                        ref={resumeFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={handleResumeFile}
                      />
                    </span>
                  </div>
                ) : (
                  <Input
                    id={field.key}
                    value={links[field.key]}
                    onChange={(e) => onLinkChange(field.key, e.target.value)}
                    placeholder={`https://...`}
                    leftIcon={field.icon}
                    error={error}
                  />
                )}
              </div>
            );
          })}
        </div>

        {resumeFileName && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Resume: {resumeFileName}</span>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            onClick={onAnalyze}
            disabled={analyzing || !hasAnyLink(links) && !resumeFileName}
            className="w-full md:w-auto"
          >
            {analyzing ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing…
              </>
            ) : (
              'Analyze Profile'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onDownloadReport}
            disabled={downloadingReport || !hasCompletedAnalysis}
            className="w-full md:w-auto"
          >
            {downloadingReport ? 'Preparing PDF…' : 'Download Report PDF'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function cnBtn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function hasAnyLink(links: SocialLinks) {
  return Object.values(links).some((v) => v.trim());
}

function UserCircleIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      ></path>
    </svg>
  );
}
