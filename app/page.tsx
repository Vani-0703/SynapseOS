"use client";
import { useRef,useState } from "react";
import { Sidebar,type View } from "@/components/Sidebar";
import { StatusStrip } from "@/components/StatusStrip";
import { ChatView } from "@/components/ChatView";
import { DocumentsView } from "@/components/DocumentsView";
import { TasksView,type TasksViewHandle } from "@/components/TasksView";
import { SystemView } from "@/components/SystemView";
import { useStatus } from "@/lib/useStatus";
export default function Home() {
 const [view,setView]=useState<View>("chat"); const [refreshKey,setRefreshKey]=useState(0); const tasksRef=useRef<TasksViewHandle>(null); const {status}=useStatus(refreshKey);
 function bump(){setRefreshKey(k=>k+1);tasksRef.current?.refresh();}
 return <div className="flex h-screen"><Sidebar active={view} onSelect={setView} status={status}/><div className="flex min-w-0 flex-1 flex-col"><StatusStrip status={status}/><div className="min-h-0 flex-1 overflow-hidden">
 {view==="chat"&&<ChatView onTasksChanged={bump}/>}
 {view==="documents"&&<div className="h-full overflow-y-auto"><DocumentsView onChanged={bump}/></div>}
 {view==="tasks"&&<div className="h-full overflow-y-auto"><TasksView ref={tasksRef}/></div>}
 {view==="system"&&<div className="h-full overflow-y-auto"><SystemView status={status}/></div>}
 </div></div></div>;
}