import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: workItems } = useQuery({
    queryKey: ['work'],
    queryFn: () => base44.entities.Work.list(),
    initialData: [],
  });

  const { data: milestones } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list(),
    initialData: [],
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const work = workItems.filter(w => w.due_date === dayStr);
    const mile = milestones.filter(m => m.due_date === dayStr);
    return [...work, ...mile];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Calendar
            </h1>
            <p className="text-slate-600">View all your deadlines and milestones</p>
          </div>
          <Button onClick={goToToday} variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center font-semibold text-slate-600 text-sm border-r border-slate-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {daysInCalendar.map((day, idx) => {
                const events = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] p-2 border-r border-b border-slate-200 ${
                      !isCurrentMonth ? 'bg-slate-50' : ''
                    } ${isDayToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-semibold mb-2 ${
                      isDayToday ? 'text-blue-600' : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className={`text-xs p-1 rounded truncate ${
                            event.status === 'completed' ? 'bg-green-100 text-green-700' :
                            event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Upcoming Work Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workItems
                  .filter(w => w.due_date && new Date(w.due_date) >= new Date())
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 5)
                  .map((work) => (
                    <div key={work.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{work.title}</p>
                        <p className="text-sm text-slate-500">{format(new Date(work.due_date), 'MMM d, yyyy')}</p>
                      </div>
                      <Badge className={
                        work.status === 'completed' ? 'bg-green-100 text-green-700' :
                        work.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {work.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                {workItems.filter(w => w.due_date && new Date(w.due_date) >= new Date()).length === 0 && (
                  <p className="text-center text-slate-500 py-4">No upcoming work items</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {milestones
                  .filter(m => m.due_date && new Date(m.due_date) >= new Date() && !m.completed)
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 5)
                  .map((milestone) => (
                    <div key={milestone.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{milestone.title}</p>
                        <p className="text-sm text-slate-500">{format(new Date(milestone.due_date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                {milestones.filter(m => m.due_date && new Date(m.due_date) >= new Date() && !m.completed).length === 0 && (
                  <p className="text-center text-slate-500 py-4">No upcoming milestones</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}