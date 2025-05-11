'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SlotsTable({ slots }: { slots: any[] }) {
  const [search, setSearch] = useState("");

  const filteredSlots = slots.filter((slot) => {
    const q = search.toLowerCase();
    const sport = slot.sports?.name?.toLowerCase() || '';
    const gender = slot.gender?.toLowerCase() || '';
    const time = slot.start_time;
    return (
      sport.includes(q) ||
      gender.includes(q) ||
      time.includes(q)
    );
  });

  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-2xl font-bold">Manage Slots</CardTitle>

        <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:w-auto">
          <Input
            placeholder="Search by sport, gender or time"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/slots/add">+ Add Slot</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        <div className="min-w-[600px]">
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Sport</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map((slot) => (
                <tr
                  key={slot.id}
                  className="border-t hover:bg-accent transition-colors"
                >
                  <td className="p-3">{slot.sports?.name}</td>
                  <td className="p-3">
                    {formatTime12hr(slot.start_time)} – {formatTime12hr(slot.end_time)}
                  </td>
                  <td className="p-3 capitalize">{slot.gender}</td>
                  <td className="p-3">
                    {slot.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/slots/edit/${slot.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {!filteredSlots.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No slots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
