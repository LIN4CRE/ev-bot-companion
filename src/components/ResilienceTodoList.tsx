import React, { useState } from "react";
import { ListTodo, Plus, Trash2, Check } from "lucide-react";
import { ResilienceTodo } from "../types";

interface ResilienceTodoListProps {
  resilienceTodos: ResilienceTodo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onResetTodos: () => void;
  onAddTodo: (text: string, description: string, category: "optimistic" | "zerolatency" | "autoretry" | "simulation" | "custom") => void;
}

export default function ResilienceTodoList({
  resilienceTodos,
  onToggleTodo,
  onDeleteTodo,
  onResetTodos,
  onAddTodo
}: ResilienceTodoListProps) {
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState<"optimistic" | "zerolatency" | "autoretry" | "simulation" | "custom">("custom");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    onAddTodo(newTodoText.trim(), newTodoDesc.trim(), newTodoCategory);
    setNewTodoText("");
    setNewTodoDesc("");
    setNewTodoCategory("custom");
    setShowTodoForm(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-slate-100 flex items-center gap-2">
              EV-Bot Resilience & Sync Task List
            </h3>
            <p className="text-xs text-slate-400">Track and toggle the core system integrations and your custom milestones.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetTodos}
            className="px-2.5 py-1 text-[10px] font-mono text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition cursor-pointer"
            title="Reset all milestones to factory defaults"
          >
            Reset Milestones
          </button>
          <button
            onClick={() => setShowTodoForm(prev => !prev)}
            className="px-2.5 py-1 text-[10px] font-mono bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/10 rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Add Custom Task
          </button>
        </div>
      </div>

      {/* Todo Add Form */}
      {showTodoForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold">Task/Milestone Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Integrate Alexa Skill inside Host"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold">Category Type</label>
              <select
                value={newTodoCategory}
                onChange={(e) => setNewTodoCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="custom">Custom Milestone</option>
                <option value="optimistic">Optimistic UI Testing</option>
                <option value="zerolatency">Cache & Storage</option>
                <option value="autoretry">Network Retry & Sync</option>
                <option value="simulation">Assistant Simulation</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold">Detailed Description</label>
            <input
              type="text"
              placeholder="What needs to be achieved in this milestone?"
              value={newTodoDesc}
              onChange={(e) => setNewTodoDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition cursor-pointer"
            >
              Save Custom Task
            </button>
          </div>
        </form>
      )}

      {/* Todo Items list */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
        {resilienceTodos.map((todo) => (
          <div
            key={todo.id}
            onClick={() => onToggleTodo(todo.id)}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
              todo.completed
                ? "bg-slate-950/25 border-slate-900/60 opacity-60 hover:opacity-80"
                : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:shadow-[0_0_12px_rgba(56,189,248,0.03)]"
            }`}
          >
            {/* Custom checkbox */}
            <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
              todo.completed
                ? "bg-sky-500 border-sky-500 text-slate-950"
                : "border-slate-700 hover:border-sky-500 text-transparent"
            }`}>
              <Check className="w-3 h-3 stroke-[3px]" />
            </div>

            {/* Text and tags */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {todo.text}
                </span>
                
                {/* Category Tag */}
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${
                  todo.category === "optimistic" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  todo.category === "zerolatency" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                  todo.category === "autoretry" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                  todo.category === "simulation" ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {todo.category}
                </span>

                {/* System vs User Tag */}
                {todo.isSystem ? (
                  <span className="px-1.5 py-0.5 text-[8px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-900/40 rounded">
                    Core Engine
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[8px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-900/40 rounded">
                    Dev Milestone
                  </span>
                )}
              </div>

              <p className={`text-[11px] leading-relaxed ${todo.completed ? 'line-through text-slate-600' : 'text-slate-400'}`}>
                {todo.description}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent toggle
                onDeleteTodo(todo.id);
              }}
              className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition self-center cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
