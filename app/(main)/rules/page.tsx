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

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Equipment Usage</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Swimming aids and equipment must be used responsibly.</li>
              <li>Return all equipment to designated storage areas after use.</li>
              <li>Report damaged equipment to staff immediately.</li>
              <li>No unauthorized equipment allowed in the pool.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Lane Etiquette</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Swim counterclockwise when sharing a lane.</li>
              <li>Choose lanes appropriate for your swimming speed.</li>
              <li>Maximum 6 swimmers per lane during busy periods.</li>
              <li>Tap a swimmer&apos;s feet once if you need to pass.</li>
              <li>Rest at the ends of the pool, not in the middle of lanes.</li>
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
              <li>If the shuttlecock hits the net during play but goes over, play continues.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Court Conduct</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Only non-marking shoes are allowed on court.</li>
              <li>Keep the court clean and free from water bottles/equipment.</li>
              <li>No shouting, abusive language, or racket throwing.</li>
              <li>Respect decisions of officials or appointed referees.</li>
              <li>Clear the court promptly when your time slot ends.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Equipment Care</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Handle nets and posts with care.</li>
              <li>Report any damaged equipment or court issues.</li>
              <li>Do not adjust the net height without staff permission.</li>
              <li>Dispose of used shuttlecocks properly.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tennis Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Tennis Court Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">Game Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Standard scoring: 0 (Love), 15, 30, 40, Game.</li>
              <li>Deuce occurs at 40-40, with advantage scoring thereafter.</li>
              <li>Serves must land in the diagonal service box.</li>
              <li>Players change ends after odd-numbered games.</li>
              <li>Ball touching any line is considered &quot;in&quot;.</li>
              <li>Server announces the score before each serve.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Court Etiquette</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Wait for a break in play before walking behind a court.</li>
              <li>Return balls from other courts between points, not during play.</li>
              <li>Keep noise to a minimum during points.</li>
              <li>Call your own lines honestly and respect opponents&apos; calls.</li>
              <li>Shake hands after the match.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Court Maintenance</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Only tennis shoes allowed (no running shoes or black-soled shoes).</li>
              <li>Remove all trash and personal items when leaving.</li>
              <li>Report court damage or hazards to staff.</li>
              <li>No food or glass containers on the court.</li>
              <li>No use of courts when wet or under maintenance.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Basketball Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Basketball Court Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">Game Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Standard pickup games are played to 11, 15, or 21 points (win by 2).</li>
              <li>Three-pointers count as 2 points and all other baskets as 1 in pickup games.</li>
              <li>Winner of the previous game stays on court (king of the court).</li>
              <li>Call your own fouls and violations honestly.</li>
              <li>&quot;Check&quot; the ball at the top of the key after fouls or out-of-bounds.</li>
              <li>No hanging on the rim except to avoid injury.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Court Conduct</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>No profanity, fighting, or intimidation allowed.</li>
              <li>Respect all players regardless of skill level.</li>
              <li>No jewelry or accessories that could cause injuries.</li>
              <li>Full-court games only when sufficient players are present.</li>
              <li>Share court space during busy periods.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Equipment Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Bring your own basketball when possible.</li>
              <li>Return borrowed equipment to proper storage.</li>
              <li>Report damaged backboards, rims, or nets.</li>
              <li>No dunking on adjustable hoops set below 10 feet.</li>
              <li>No moving or adjusting equipment without staff permission.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
