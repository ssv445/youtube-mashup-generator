"use client";

import { useState, useEffect } from "react";
import ProjectSelector from "@/components/ProjectSelector";
import SegmentList from "@/components/SegmentList";
import PreviewPlayer from "@/components/PreviewPlayer";
import GenerateButton from "@/components/GenerateButton";
import { Project, Segment } from "@/lib/types";
import { loadProjects, saveProjects, createNewProject } from "@/lib/localStorage";
import { validateAllSegments } from "@/lib/validation";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);

    if (loadedProjects.length > 0) {
      setShowContinuePrompt(true);
    } else {
      // Create first project
      const newProject = createNewProject();
      setProjects([newProject]);
      setCurrentProjectId(newProject.id);
    }
  }, []);

  // Get current project
  const currentProject = projects.find(p => p.id === currentProjectId);

  // Update segments when project changes
  useEffect(() => {
    if (currentProject) {
      setSegments(currentProject.segments);
    }
  }, [currentProjectId]); // Only depend on project ID, not the whole project object

  // Auto-save when segments change
  useEffect(() => {
    if (currentProjectId && segments.length >= 0) {
      const updatedProjects = projects.map(p =>
        p.id === currentProjectId
          ? { ...p, segments, updatedAt: new Date().toISOString() }
          : p
      );
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
    }
  }, [segments]); // Only depend on segments, not projects or currentProjectId

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentSegmentIndex(0);
  };

  const handleProjectCreate = () => {
    const newProject = createNewProject();
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProjectId(newProject.id);
    saveProjects(updatedProjects);
  };

  const handleProjectRename = (projectId: string, newName: string) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId ? { ...p, name: newName } : p
    );
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    if (projectId === currentProjectId) {
      if (updatedProjects.length > 0) {
        setCurrentProjectId(updatedProjects[0].id);
      } else {
        const newProject = createNewProject();
        setProjects([newProject]);
        setCurrentProjectId(newProject.id);
      }
    }
  };

  const handleProjectDuplicate = (projectId: string) => {
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (projectToDuplicate) {
      const duplicatedProject: Project = {
        ...projectToDuplicate,
        id: crypto.randomUUID(),
        name: `${projectToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedProjects = [...projects, duplicatedProject];
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      setCurrentProjectId(duplicatedProject.id);
    }
  };

  const handleContinuePrevious = () => {
    setCurrentProjectId(projects[0].id);
    setShowContinuePrompt(false);
  };

  const handleStartNew = () => {
    const newProject = createNewProject();
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProjectId(newProject.id);
    saveProjects(updatedProjects);
    setShowContinuePrompt(false);
  };

  const validationResult = validateAllSegments(segments);
  const isValid = validationResult.isValid;

  if (showContinuePrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">
            You have a previous project. Would you like to continue or start a new one?
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleContinuePrevious}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Previous
            </button>
            <button
              onClick={handleStartNew}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Start New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Parody Song Generator
          </h1>
          <ProjectSelector
            projects={projects}
            currentProjectId={currentProjectId}
            onProjectChange={handleProjectChange}
            onProjectCreate={handleProjectCreate}
            onProjectRename={handleProjectRename}
            onProjectDelete={handleProjectDelete}
            onProjectDuplicate={handleProjectDuplicate}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Segment List (40%) */}
          <div className="lg:col-span-2">
            <SegmentList
              segments={segments}
              onSegmentsChange={setSegments}
              currentSegmentIndex={currentSegmentIndex}
              onSegmentClick={setCurrentSegmentIndex}
            />
          </div>

          {/* Right Panel - Preview Player (60%) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <PreviewPlayer
                segments={segments}
                currentSegmentIndex={currentSegmentIndex}
                onSegmentChange={setCurrentSegmentIndex}
                onSegmentVerified={(index) => {
                  const updatedSegments = [...segments];
                  updatedSegments[index].verified = true;
                  setSegments(updatedSegments);
                }}
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <GenerateButton
            segments={segments}
            isValid={isValid}
            validationErrors={validationResult.errors}
            projectName={currentProject?.name || "Untitled"}
          />
        </div>
      </main>
    </div>
  );
}
