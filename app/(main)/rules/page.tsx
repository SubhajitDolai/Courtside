'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 md:px-0 pt-30 space-y-10">
      <Alert className="bg-primary/10 border-primary mb-8">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          All users must adhere to these rules to maintain facility standards and ensure everyone&apos;s safety.
        </AlertDescription>
      </Alert>

      {/* Swimming Pool Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Swimming Pool Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">Safety Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>No diving in shallow areas (less than 5 feet deep).</li>
              <li>No running or horseplay around the pool area.</li>
              <li>No food, drinks, or glass containers in the pool area.</li>
              <li>Children under 12 must be accompanied by an adult.</li>
              <li>No swimming during lightning or thunder storms.</li>
              <li>Shower before entering the pool.</li>
              <li>Use the restroom facilities, not the pool.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Badminton Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Badminton Court Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">Game Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Games are played to 21 points with a clear 2-point lead (cap at 30).</li>
              <li>Service alternates between right and left courts when server scores.</li>
              <li>During service, the racket head must be below waist level.</li>
              <li>The shuttlecock must be hit before it touches the ground.</li>
              <li>A point is scored on every serve regardless of who serves.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Wrestling Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Wrestling Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">General Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Matches are conducted on a standard wrestling mat.</li>
              <li>Participants must wear proper wrestling attire.</li>
              <li>No striking, biting, or unsportsmanlike conduct is allowed.</li>
              <li>Points are awarded for takedowns, escapes, and reversals.</li>
              <li>Matches are supervised by a referee whose decisions are final.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Table Tennis Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Table Tennis Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">Game Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Games are played to 11 points with a 2-point lead.</li>
              <li>Service alternates every 2 points, except during deuce.</li>
              <li>The ball must be tossed at least 6 inches during service.</li>
              <li>A point is scored if the opponent fails to return the ball.</li>
              <li>Players switch sides after each game.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Indoor Games Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Indoor Games Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">Chess</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Standard chess rules apply.</li>
              <li>Players must use the clock provided for timed games.</li>
              <li>Touch-move rule is enforced.</li>
              <li>Respect your opponent and maintain silence during play.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Carrom</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Players must use the striker provided.</li>
              <li>No leaning over the board beyond the baseline.</li>
              <li>Fouls result in penalties as per standard rules.</li>
              <li>Keep the board clean and free of debris.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Foosball</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>No spinning the rods excessively.</li>
              <li>Games are played to 5 or 10 points, as agreed upon.</li>
              <li>Respect the equipment and avoid rough handling.</li>
              <li>Allow others to play during busy periods.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
