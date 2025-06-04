'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Clock, Search, Plus, Filter } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SlotsTable({ slots }: { slots: any[] }) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  // ✅ Unique dropdown options
  const uniqueSports = Array.from(new Set(slots.map((s) => s.sports?.name).filter(Boolean)));
  const uniqueUserTypes = Array.from(new Set(slots.map((s) => s.allowed_user_type || 'any')));
  const genders = ['male', 'female', 'any'];

  const filteredSlots = slots.filter((slot) => {
    const q = search.toLowerCase();
    const sport = slot.sports?.name?.toLowerCase() || '';
    const gender = slot.gender?.toLowerCase() || '';
    const userType = slot.allowed_user_type?.toLowerCase() || '';
    const time = slot.start_time;

    const matchSearch = sport.includes(q) || gender.includes(q) || userType.includes(q) || time.includes(q);
    const matchSport = sportFilter === "all" ? true : slot.sports?.name === sportFilter;
    const matchGender = genderFilter === "all" ? true : slot.gender === genderFilter;
    const matchUserType = userTypeFilter === "all" ? true : slot.allowed_user_type === userTypeFilter;

    return matchSearch && matchSport && matchGender && matchUserType;
  });

  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  };

  const hasActiveFilters = search || sportFilter !== 'all' || genderFilter !== 'all' || userTypeFilter !== 'all';

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Clock className="h-5 w-5 text-green-600 dark:text-green-500" />
          Manage Slots
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search slots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-400"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Sport Filter */}
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {uniqueSports.map((sport) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Gender Filter */}
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full sm:w-[120px] border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* User Type Filter */}
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="All User Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All User Types</SelectItem>
                  {uniqueUserTypes.map((u) => (
                    <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Button */}
              <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/slots/add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Link>
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <Filter className="h-4 w-4" />
                Active Filters:
              </div>
              
              {search && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/70 cursor-pointer"
                  onClick={() => setSearch('')}
                >
                  Search: &quot;{search}&quot;
                </Badge>
              )}
              
              {sportFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-neutral-100 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-900/70 cursor-pointer"
                  onClick={() => setSportFilter('all')}
                >
                  Sport: {sportFilter}
                </Badge>
              )}
              
              {genderFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 cursor-pointer"
                  onClick={() => setGenderFilter('all')}
                >
                  Gender: {genderFilter}
                </Badge>
              )}
              
              {userTypeFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/70 cursor-pointer"
                  onClick={() => setUserTypeFilter('all')}
                >
                  User Type: {userTypeFilter}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSportFilter('all');
                  setGenderFilter('all');
                  setUserTypeFilter('all');
                }}
                className="h-6 px-2 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/50"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
          <div className="min-w-[700px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Sport</th>
                  <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Time</th>
                  <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Gender</th>
                  <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">User Type</th>
                  <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Status</th>
                  <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot, index) => (
                  <tr 
                    key={slot.id} 
                    className={`
                      hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200
                      ${index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}
                      border-t border-neutral-200 dark:border-neutral-700
                    `}
                  >
                    <td className="p-3">
                      <span className="font-medium bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm">
                        {slot.sports?.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {formatTime12hr(slot.start_time)} – {formatTime12hr(slot.end_time)}
                      </div>
                    </td>
                    <td className="p-3 capitalize text-neutral-700 dark:text-neutral-300">{slot.gender}</td>
                    <td className="p-3 capitalize text-neutral-700 dark:text-neutral-300">{slot.allowed_user_type || 'any'}</td>
                    <td className="p-3">
                      {slot.is_active ? (
                        <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200 dark:border-green-700 border">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-200 dark:border-red-700 border">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        asChild
                        className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Link href={`/admin/slots/edit/${slot.id}`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filteredSlots.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
                          <Search className="h-8 w-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No slots found</h3>
                        <p className="text-muted-foreground">No slots match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}