import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import StatsCard from "../components/work/StatsCard";

export default function Team() {
  const { data: workItems } = useQuery({
    queryKey: ['work'],
    queryFn: () => base44.entities.Work.list(),
    initialData: [],
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.WorkSession.list(),
    initialData: [],
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  // Get team member stats
  const teamStats = users.map(user => {
    const userWork = workItems.filter(w => w.assigned_to === user.email || w.created_by === user.email);
    const userSessions = sessions.filter(s => s.created_by === user.email && !s.is_active);
    const totalMinutes = userSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    return {
      ...user,
      totalTasks: userWork.length,
      completedTasks: userWork.filter(w => w.status === 'completed').length,
      inProgressTasks: userWork.filter(w => w.status === 'in_progress').length,
      hoursTracked: (totalMinutes / 60).toFixed(1)
    };
  });

  const overallStats = {
    totalMembers: users.length,
    totalTasks: workItems.length,
    completedTasks: workItems.filter(w => w.status === 'completed').length,
    totalHours: teamStats.reduce((sum, u) => sum + parseFloat(u.hoursTracked), 0).toFixed(1)
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Team Overview
          </h1>
          <p className="text-slate-600">Track team members and their contributions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Team Members"
            value={overallStats.totalMembers}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Tasks"
            value={overallStats.totalTasks}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard
            title="Completed"
            value={overallStats.completedTasks}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatsCard
            title="Hours Tracked"
            value={overallStats.totalHours}
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamStats.map((member) => (
                <Card key={member.id} className="border border-slate-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-semibold">
                          {member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{member.full_name || 'Team Member'}</h3>
                        <p className="text-sm text-slate-500">{member.email}</p>
                        <Badge className="mt-1" variant="outline">
                          {member.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Tasks</span>
                        <span className="font-semibold text-slate-900">{member.totalTasks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Completed</span>
                        <span className="font-semibold text-green-600">{member.completedTasks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">In Progress</span>
                        <span className="font-semibold text-blue-600">{member.inProgressTasks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Hours Tracked</span>
                        <span className="font-semibold text-purple-600">{member.hoursTracked}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {teamStats.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No team members yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}