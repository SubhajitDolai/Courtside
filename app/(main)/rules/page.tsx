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
          All participants are required to adhere to these rules to maintain the facility&apos;s standards and ensure a safe and respectful environment.
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
              <li>Diving is strictly prohibited in areas with a depth of less than 5 feet.</li>
              <li>Maintain a calm and orderly demeanor; running or roughhousing is not permitted in the pool vicinity.</li>
              <li>Consumption of food, beverages, or the use of glass containers is not allowed in the pool area.</li>
              <li>All participants are required to take a shower prior to entering the pool to maintain hygiene standards.</li>
              <li>Please utilize restroom facilities before entering the pool to ensure cleanliness and safety.</li>
              <li>Proper swimwear is mandatory for all participants.</li>
              <li>Do not obstruct lifeguards or interfere with their duties.</li>
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
              <li>Service alternates between right and left courts when the server scores.</li>
              <li>During service, the racket head must remain below waist level.</li>
              <li>The shuttlecock must be hit before it touches the ground.</li>
              <li>A point is scored on every serve, regardless of who serves.</li>
              <li>Players must wear non-marking shoes to protect the court surface.</li>
              <li>Do not enter the court until the previous game has concluded.</li>
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
              <li>Participants must wear appropriate wrestling attire.</li>
              <li>No striking, biting, or unsportsmanlike conduct is permitted.</li>
              <li>Points are awarded for takedowns, escapes, and reversals.</li>
              <li>All matches are supervised by a referee, whose decisions are final.</li>
              <li>Participants must warm up before matches to prevent injuries.</li>
              <li>All jewelry and accessories must be removed before entering the mat.</li>
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
              <li>Players must switch sides after each game.</li>
              <li>Only standard table tennis paddles and balls are permitted.</li>
              <li>Do not lean on or place items on the table.</li>
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
              <li>The touch-move rule is enforced.</li>
              <li>Maintain silence and respect your opponent during play.</li>
              <li>Players must reset the board after completing their game.</li>
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
              <li>Participants must avoid excessive powder usage on the board.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Foosball</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>No excessive spinning of the rods.</li>
              <li>Games are played to 5 or 10 points, as agreed upon.</li>
              <li>Respect the equipment and avoid rough handling.</li>
              <li>Allow others to play during busy periods.</li>
              <li>Do not apply excessive force to the rods to prevent damage.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
