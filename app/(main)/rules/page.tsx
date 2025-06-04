'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, BookOpen } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import BannedRedirect from '@/components/banned-redirect'

export default function RulesPage() {
  return (
    <>
      <BannedRedirect />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section - Matching App Style */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Facility
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Rules</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Facility usage guidelines
            </p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 mb-8">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Important Notice</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                All participants are required to adhere to these rules to maintain the facility&apos;s standards and ensure a safe and respectful environment.
              </AlertDescription>
            </Alert>

            {/* Swimming Pool Rules */}
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Swimming Pool Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Safety Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
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
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Badminton Court Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Game Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
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
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Wrestling Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">General Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
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
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Table Tennis Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Game Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
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
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Indoor Games Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Chess</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Standard chess rules apply.</li>
                    <li>Players must use the clock provided for timed games.</li>
                    <li>The touch-move rule is enforced.</li>
                    <li>Maintain silence and respect your opponent during play.</li>
                    <li>Players must reset the board after completing their game.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Carrom</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Players must use the striker provided.</li>
                    <li>No leaning over the board beyond the baseline.</li>
                    <li>Fouls result in penalties as per standard rules.</li>
                    <li>Keep the board clean and free of debris.</li>
                    <li>Participants must avoid excessive powder usage on the board.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Foosball</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
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
        </div>
      </div>
    </>
  )
}