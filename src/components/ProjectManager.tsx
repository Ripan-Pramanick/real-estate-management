import React, { useState, useEffect } from 'react';
import { Project, GanttTask, ProjectMilestone } from '../types';
import { 
  Building2, MapPin, User, Calendar, DollarSign, ShieldAlert, 
  Plus, CheckCircle2, Activity, X, Sparkles, ListTodo, 
  CheckSquare, Network, Clock, ArrowRight, ShieldCheck, Award
} from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (projectId: string, updatedFields: Partial<Project>) => void;
  isBasicPlan?: boolean;
  ganttTasks?: GanttTask[];
  onAddGanttTask?: (task: GanttTask) => void;
  onUpdateGanttTask?: (id: string, updatedFields: Partial<GanttTask>) => void;
  projectMilestones?: ProjectMilestone[];
  onAddMilestone?: (milestone: ProjectMilestone) => void;
  onUpdateMilestone?: (id: string, updatedFields: Partial<ProjectMilestone>) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onAddProject,
  onUpdateProject,
  isBasicPlan = false,
  ganttTasks = [],
  onAddGanttTask,
  onUpdateGanttTask,
  projectMilestones = [],
  onAddMilestone,
  onUpdateMilestone,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [projectSubTab, setProjectSubTab] = useState<'overview' | 'gantt' | 'milestones'>('overview');

  const [showAddGanttForm, setShowAddGanttForm] = useState(false);
  const [newGanttName, setNewGanttName] = useState('');
  const [newGanttProgress, setNewGanttProgress] = useState(0);
  const [newGanttDays, setNewGanttDays] = useState(10);
  const [newGanttDep, setNewGanttDep] = useState('');

  const [showAddMilestoneForm, setShowAddMilestoneForm] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newManager, setNewManager] = useState('');
  const [newSupervisor, setNewSupervisor] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'Planning' | 'Excavation' | 'Structure' | 'Finishing' | 'Completed'>('Planning');

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation || !newBudget) return;

    const newPrj = {
      name: newName,
      location: newLocation,
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : newStatus === 'Planning' ? 0 : 15,
      budget: Number(newBudget),
      spent: 0,
      startDate: newStartDate || new Date().toISOString().split('T')[0],
      endDate: newEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: newManager || null,
      siteSupervisor: newSupervisor || null,
      safetyRating: 'A',
      description: newDescription || null,
    } as unknown as Project;

    onAddProject(newPrj);
    setShowAddForm(false);
    
    setNewName('');
    setNewLocation('');
    setNewBudget('');
    setNewManager('');
    setNewSupervisor('');
    setNewStartDate('');
    setNewEndDate('');
    setNewDescription('');
    setNewStatus('Planning');
  };

  const advanceStage = (prj: Project) => {
    const stages: Project['status'][] = ['Planning', 'Excavation', 'Structure', 'Finishing', 'Completed'];
    const currentIndex = stages.indexOf(prj.status);
    if (currentIndex < stages.length - 1) {
      const nextStatus = stages[currentIndex + 1];
      const nextProgress = nextStatus === 'Completed' ? 100 : Math.min(prj.progress + 20, 95);
      onUpdateProject(prj.id, { status: nextStatus, progress: nextProgress });
    }
  };

  const updateProgressValue = (prj: Project, value: number) => {
    const fields: Partial<Project> = { progress: value };
    if (value === 100) {
      fields.status = 'Completed';
    } else if (value < 100 && prj.status === 'Completed') {
      fields.status = 'Finishing';
    }
    onUpdateProject(prj.id, fields);
  };

  const changeSafety = (prj: Project, rating: string) => {
    onUpdateProject(prj.id, { safetyRating: rating });
  };

  const filteredProjects = projects.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Project Portfolio</h4>
            <button
              id="btn-add-project"
              onClick={() => setShowAddForm(true)}
              className="p-1.5 bg-zinc-800 text-white border border-zinc-700 rounded hover:bg-zinc-700 transition-colors cursor-pointer"
              title="Add New Project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {['all', 'Planning', 'Excavation', 'Structure', 'Finishing', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-zinc-850 text-white border border-zinc-700'
                    : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredProjects.map(p => {
              const isSelected = p.id === selectedProjectId;
              return (
                <div
                  key={p.id}
                  id={`prj-card-${p.id}`}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`p-3 rounded border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                      : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-semibold truncate pr-2">{p.name}</h5>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
                      p.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.status === 'Finishing' ? 'bg-cyan-500/20 text-cyan-400' :
                      p.status === 'Structure' ? 'bg-indigo-500/20 text-indigo-400' :
                      p.status === 'Excavation' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700 text-zinc-300'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          p.status === 'Completed' ? 'bg-emerald-500' : 'bg-white'
                        }`} 
                        style={{ width: `${p.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredProjects.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">No construction sites in this category.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {selectedProject ? (
          <div className="bg-[#111114] p-6 rounded-lg border border-zinc-800 space-y-6 text-left">
            <div className="flex border-b border-zinc-800 gap-4">
              <button
                onClick={() => setProjectSubTab('overview')}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  projectSubTab === 'overview'
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-450" /> Blueprint Overview
              </button>
              <button
                onClick={() => setProjectSubTab('gantt')}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  projectSubTab === 'gantt'
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Network className="w-4 h-4 text-amber-450" /> Gantt Timeline
              </button>
              <button
                onClick={() => setProjectSubTab('milestones')}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  projectSubTab === 'milestones'
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Award className="w-4 h-4 text-rose-450" /> Milestones Registry
              </button>
            </div>

            {projectSubTab === 'overview' ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                      Active Site ID: {selectedProject.id?.substring(0, 8)}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{selectedProject.name}</h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {selectedProject.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Site Safety:</span>
                    <select
                      value={selectedProject.safetyRating}
                      onChange={(e) => changeSafety(selectedProject, e.target.value)}
                      className="text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded p-1 text-zinc-300"
                    >
                      <option value="A+">A+ Rating</option>
                      <option value="A">A Rating</option>
                      <option value="B">B Rating</option>
                      <option value="C">C Rating</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Scope & Design Blueprint</h5>
                  <p className="text-xs text-zinc-300 bg-[#09090b] border border-zinc-850 p-3 rounded-lg leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/40 p-4 rounded border border-zinc-800">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Construction Progress Range</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-semibold text-white">{selectedProject.progress}%</span>
                        <span className="text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                          {selectedProject.status}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedProject.progress}
                        onChange={(e) => updateProgressValue(selectedProject, Number(e.target.value))}
                        className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>Planning</span>
                        <span>Structure</span>
                        <span>Commissioned</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 p-4 rounded border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Advance Construction Stage</h5>
                      <p className="text-xs text-zinc-500 leading-normal mb-3">
                        Unlock structural phases sequentially. Advancing auto-calculates baseline timeline increments.
                      </p>
                    </div>
                    {selectedProject.status !== 'Completed' ? (
                      <button
                        onClick={() => advanceStage(selectedProject)}
                        className="w-full py-2 px-4 bg-white text-zinc-950 font-bold text-xs rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5" /> Advance to Next Stage
                      </button>
                    ) : (
                      <div className="py-2 text-center text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 rounded flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Structure fully commissioned
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Financial Burn Status</h5>
                    <div className="space-y-2 bg-[#09090b] p-3 rounded border border-zinc-850">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Total Allocated Budget:</span>
                        <span className="font-bold text-white">${selectedProject.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Expended to Date:</span>
                        <span className="font-bold text-white">${selectedProject.spent.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${selectedProject.spent > selectedProject.budget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>Burn rate: {Math.round((selectedProject.spent / selectedProject.budget) * 100)}%</span>
                        <span>Remaining: ${(selectedProject.budget - selectedProject.spent).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Site Execution Staff</h5>
                    <div className="space-y-2 bg-[#09090b] p-3 rounded border border-zinc-850 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-400">Project Manager:</span>
                        <span className="font-semibold text-white ml-auto">{selectedProject.manager}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-400">Site Supervisor:</span>
                        <span className="font-semibold text-white ml-auto">{selectedProject.siteSupervisor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-400">Project Bounds:</span>
                        <span className="font-mono text-[11px] text-white ml-auto">
                          {selectedProject.startDate} to {selectedProject.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : projectSubTab === 'gantt' ? (
              isBasicPlan ? (
                <div className="bg-[#16161a] border border-zinc-800 p-8 rounded-lg text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Network className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Gantt Timeline Chart is Locked</h4>
                    <p className="text-xs text-zinc-450 leading-relaxed">
                      Interactive Gantt Charts and scheduling dependencies are exclusive to the <span className="text-white font-semibold">Business Plan</span>.
                    </p>
                    <p className="text-[11px] text-amber-400/80 font-medium">
                      Super Admins can upgrade this client to the Business Plan in the client manager to unlock structural timeline tracking.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Critical Path & Phase Dependencies</h4>
                      <p className="text-[11px] text-zinc-500">Drag sliders to adjust task completion levels in real time</p>
                    </div>
                    <button
                      onClick={() => setShowAddGanttForm(!showAddGanttForm)}
                      className="px-2.5 py-1.5 bg-white text-zinc-950 font-bold text-[11px] rounded hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Schedule Task
                    </button>
                  </div>

                  {showAddGanttForm && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newGanttName || !onAddGanttTask) return;
                        onAddGanttTask({
                          projectId: selectedProject.id,
                          name: newGanttName,
                          progress: Number(newGanttProgress),
                          durationDays: Number(newGanttDays),
                          dependencyId: newGanttDep || null,
                          isCompleted: Number(newGanttProgress) === 100
                        } as unknown as GanttTask);
                        setNewGanttName('');
                        setNewGanttProgress(0);
                        setNewGanttDays(10);
                        setNewGanttDep('');
                        setShowAddGanttForm(false);
                      }}
                      className="bg-zinc-900/60 p-4 border border-zinc-800 rounded space-y-3.5 text-xs"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Task Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Foundation Pouring"
                            value={newGanttName}
                            onChange={(e) => setNewGanttName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Duration (Days)</label>
                          <input
                            type="number"
                            min="1"
                            value={newGanttDays}
                            onChange={(e) => setNewGanttDays(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Precedent Task (Dependency)</label>
                          <select
                            value={newGanttDep}
                            onChange={(e) => setNewGanttDep(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                          >
                            <option value="">No precedent dependency</option>
                            {ganttTasks
                              .filter(t => t.projectId === selectedProject.id)
                              .map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Initial Progress %</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={newGanttProgress}
                            onChange={(e) => setNewGanttProgress(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                          <span className="text-[10px] text-zinc-500 font-mono block mt-1">{newGanttProgress}% complete</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-zinc-800/80 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddGanttForm(false)}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-white text-zinc-950 font-semibold rounded"
                        >
                          Save Task
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {ganttTasks.filter(t => t.projectId === selectedProject.id).length === 0 ? (
                      <div className="p-8 border border-zinc-850 bg-zinc-900/10 rounded text-center text-xs text-zinc-500">
                        No timeline tasks logged for this site. Click 'Log Schedule Task' to build your critical path.
                      </div>
                    ) : (
                      <div className="border border-zinc-800 bg-zinc-900/20 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 gap-2 bg-[#09090b] px-4 py-2 border-b border-zinc-800 text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold">
                          <div className="col-span-5">Activity</div>
                          <div className="col-span-2 text-center">Duration</div>
                          <div className="col-span-5">Visual Duration / Progress Graph</div>
                        </div>

                        <div className="divide-y divide-zinc-850">
                          {ganttTasks
                            .filter(t => t.projectId === selectedProject.id)
                            .map((task) => {
                              const dependencyTask = ganttTasks.find(x => x.id === task.dependencyId);
                              return (
                                <div key={task.id} className="grid grid-cols-12 gap-2 px-4 py-3.5 items-center">
                                  <div className="col-span-5 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={(e) => {
                                          if (onUpdateGanttTask) {
                                            onUpdateGanttTask(task.id, {
                                              isCompleted: e.target.checked,
                                              progress: e.target.checked ? 100 : Math.min(task.progress, 90)
                                            });
                                          }
                                        }}
                                        className="w-3.5 h-3.5 accent-white rounded border-zinc-700 bg-zinc-900"
                                      />
                                      <span className={`text-xs font-semibold text-white ${task.isCompleted ? 'line-through text-zinc-500' : ''}`}>
                                        {task.name}
                                      </span>
                                    </div>
                                    {dependencyTask && (
                                      <div className="text-[10px] text-amber-500 flex items-center gap-1 font-medium pl-5">
                                        <Network className="w-3 h-3" /> Precedent: <span className="underline">{dependencyTask.name}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="col-span-2 text-center text-xs font-mono text-zinc-400 font-semibold">
                                    {task.durationDays} Days
                                  </div>

                                  <div className="col-span-5 space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                      <span>Progress Tracker</span>
                                      <span>{task.progress}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={task.progress}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          if (onUpdateGanttTask) {
                                            onUpdateGanttTask(task.id, {
                                              progress: val,
                                              isCompleted: val === 100
                                            });
                                          }
                                        }}
                                        className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-white"
                                      />
                                    </div>
                                    <div className="w-full bg-zinc-950 h-2.5 rounded-sm relative overflow-hidden">
                                      <div
                                        className={`h-full absolute left-0 ${task.isCompleted ? 'bg-emerald-500/70' : 'bg-amber-500/60'}`}
                                        style={{ width: `${task.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              isBasicPlan ? (
                <div className="bg-[#16161a] border border-zinc-800 p-8 rounded-lg text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                    <Award className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Site Milestones Registry is Locked</h4>
                    <p className="text-xs text-zinc-455 leading-relaxed">
                      Tracking physical site milestones and completion certificates is exclusive to the <span className="text-white font-semibold">Business Plan</span>.
                    </p>
                    <p className="text-[11px] text-rose-400/80 font-medium">
                      Super Admins can upgrade this client to the Business Plan to enable milestone logging.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Site Milestones & Regulatory Approvals</h4>
                      <p className="text-[11px] text-zinc-500">Record physical achievements and sign-offs</p>
                    </div>
                    <button
                      onClick={() => setShowAddMilestoneForm(!showAddMilestoneForm)}
                      className="px-2.5 py-1.5 bg-white text-zinc-950 font-bold text-[11px] rounded hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Site Milestone
                    </button>
                  </div>

                  {showAddMilestoneForm && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMilestoneTitle || !onAddMilestone) return;
                        onAddMilestone({
                          projectId: selectedProject.id,
                          title: newMilestoneTitle,
                          description: newMilestoneDesc || null,
                          targetDate: newMilestoneDate || new Date().toISOString().split('T')[0],
                          isCompleted: false
                        } as unknown as ProjectMilestone);
                        setNewMilestoneTitle('');
                        setNewMilestoneDesc('');
                        setNewMilestoneDate('');
                        setShowAddMilestoneForm(false);
                      }}
                      className="bg-zinc-900/60 p-4 border border-zinc-800 rounded space-y-3.5 text-xs"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-zinc-400 font-semibold mb-1">Milestone Name / Phase Approval Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Phase 1 Excavation Sign-off"
                            value={newMilestoneTitle}
                            onChange={(e) => setNewMilestoneTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Target Date</label>
                          <input
                            type="date"
                            value={newMilestoneDate}
                            onChange={(e) => setNewMilestoneDate(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Brief Criteria Description</label>
                          <input
                            type="text"
                            placeholder="e.g. Geotechnical soil samples certified"
                            value={newMilestoneDesc}
                            onChange={(e) => setNewMilestoneDesc(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-zinc-800/80 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMilestoneForm(false)}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-white text-zinc-950 font-semibold rounded"
                        >
                          Register Milestone
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {projectMilestones.filter(m => m.projectId === selectedProject.id).length === 0 ? (
                      <div className="p-8 border border-zinc-850 bg-zinc-900/10 rounded text-center text-xs text-zinc-500">
                        No milestone achievements logged. Click 'Log Site Milestone' to initialize approvals.
                      </div>
                    ) : (
                      projectMilestones
                        .filter(m => m.projectId === selectedProject.id)
                        .map((milestone) => (
                          <div
                            key={milestone.id}
                            className={`p-4 border rounded-lg transition-colors flex items-start gap-4 ${
                              milestone.isCompleted
                                ? 'bg-emerald-950/10 border-emerald-900/30'
                                : 'bg-[#111114] border-zinc-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={milestone.isCompleted}
                              onChange={(e) => {
                                if (onUpdateMilestone) {
                                  onUpdateMilestone(milestone.id, { isCompleted: e.target.checked });
                                }
                              }}
                              className="w-4 h-4 mt-1 accent-emerald-500 cursor-pointer"
                            />

                            <div className="space-y-1 flex-1 text-left">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className={`text-xs font-bold ${milestone.isCompleted ? 'text-emerald-300 line-through' : 'text-white'}`}>
                                  {milestone.title}
                                </h5>
                                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 font-semibold">
                                  <Calendar className="w-3 h-3 text-zinc-600" /> Target: {milestone.targetDate}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 font-medium">
                                {milestone.description}
                              </p>
                              {milestone.isCompleted && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded mt-2">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Site Inspector Signed-off
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">Select a project to view timelines and construction metrics.</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] rounded-lg shadow-xl border border-zinc-800 max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#09090b] border-b border-zinc-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Initialize Construction Site</h4>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Project / Site Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Grand Horizon Towers"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Location Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Sector 12, Tech Corridor"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Capital Budget ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. 5000000"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Excavation">Excavation</option>
                    <option value="Structure">Structure</option>
                    <option value="Finishing">Finishing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Project Manager
                  </label>
                  <input
                    type="text"
                    value={newManager}
                    onChange={(e) => setNewManager(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Site Supervisor
                  </label>
                  <input
                    type="text"
                    value={newSupervisor}
                    onChange={(e) => setNewSupervisor(e.target.value)}
                    placeholder="Marcus Thorne"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Blueprint / Project Scope Details
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize architectural highlights, material constraints, transit link integrations..."
                  className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700 h-20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded transition-colors cursor-pointer"
                >
                  Commission Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};