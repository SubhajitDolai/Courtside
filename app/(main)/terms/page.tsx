import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function TermsPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section - Matching App Style */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Terms &
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Conditions</span>
            </h1>

          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 mb-8">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">Legal Notice</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                By using our facilities, you agree to comply with all terms and conditions outlined below. Please read carefully before booking.
              </AlertDescription>
            </Alert>

            {/* Swimming Terms */}
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Swimming Pool Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">General Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Swimming is allowed only during designated hours under supervision (if applicable).</li>
                    <li>Proper swimwear must be worn at all times.</li>
                    <li>Users must shower before entering the pool.</li>
                    <li>No running, rough play, pushing, acrobatics, dunking, wrestling, or reckless diving.</li>
                    <li>No chewing gum or shoes on the pool deck.</li>
                    <li>Users are responsible for their belongings.</li>
                    <li>Disturbances, inappropriate language, or indecent behavior will lead to removal.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Medical Declaration</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>I declare that I am medically fit to use the swimming pool and have no health conditions (e.g., epilepsy, heart issues, infections).</li>
                    <li>I authorize the university to take necessary action in case of a medical emergency.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Penalties & Disciplinary Actions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Temporary suspension (up to 1 month) for rule violations.</li>
                    <li>Year-long ban or permanent suspension for repeated/serious violations.</li>
                    <li>Users are liable for any damage caused to the pool or its equipment.</li>
                    <li>The university&apos;s decision is final and binding.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Liability Waiver</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    I understand that use of the swimming pool is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from its use.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badminton Terms */}
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Badminton Court Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">General Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Court usage is allowed only during designated hours and as per slot allocation.</li>
                    <li>Non-marking sports shoes and proper attire are mandatory.</li>
                    <li>Players must bring their own rackets and shuttlecocks.</li>
                    <li>No spitting, chewing gum, or food inside the court.</li>
                    <li>No rough behavior, shouting, or equipment misuse.</li>
                    <li>Users are responsible for their belongings.</li>
                    <li>Unauthorized access or misuse may lead to disciplinary action.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Medical Declaration</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>I declare that I am medically fit to use the badminton court and have no health conditions (e.g., heart or joint problems, recent injuries).</li>
                    <li>I authorize the university to take necessary action in case of a medical emergency.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Penalties & Disciplinary Actions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Temporary suspension (up to 1 month) for rule violations.</li>
                    <li>Year-long or permanent suspension for serious/repeated misconduct.</li>
                    <li>Users will be charged for any damage caused by negligence or intentionally.</li>
                    <li>The university&apos;s decision is final and binding.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Liability Waiver</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    I understand that use of the badminton court is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from its use.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Wrestling Terms */}
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Wrestling Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">General Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Wrestling is allowed only during designated hours with proper supervision.</li>
                    <li>Appropriate wrestling attire and protective gear are mandatory.</li>
                    <li>No jewelry, watches, or sharp objects are permitted on the mat.</li>
                    <li>Participants must warm up properly before engaging in any wrestling activity.</li>
                    <li>Unsportsmanlike conduct, excessive aggression, or dangerous moves are prohibited.</li>
                    <li>Users are responsible for their belongings and equipment.</li>
                    <li>The mat must be kept clean and free from debris.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Medical Declaration</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>I declare that I am medically fit for wrestling and have no health conditions (e.g., heart problems, joint issues, recent injuries).</li>
                    <li>I authorize the university to take necessary action in case of a medical emergency.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Penalties & Disciplinary Actions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Immediate suspension for dangerous or unsportsmanlike behavior.</li>
                    <li>Temporary suspension (up to 1 month) for rule violations.</li>
                    <li>Year-long or permanent suspension for serious misconduct or repeated violations.</li>
                    <li>Users are liable for any damage caused to equipment or facilities.</li>
                    <li>The university&apos;s decision is final and binding.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Liability Waiver</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    I understand that wrestling involves inherent risks and that participation is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from wrestling activities.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Table Tennis Terms */}
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Table Tennis Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">General Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Table tennis usage is allowed only during designated hours and as per slot allocation.</li>
                    <li>Players must bring their own paddles; balls may be provided or brought by users.</li>
                    <li>Non-marking shoes and appropriate attire are recommended.</li>
                    <li>No food, drinks, or personal items should be placed on the playing surface.</li>
                    <li>Users must respect equipment and avoid excessive force or misuse.</li>
                    <li>Players are responsible for their belongings and equipment.</li>
                    <li>Maintain sportsmanship and respect for other users at all times.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Medical Declaration</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>I declare that I am medically fit to play table tennis and have no health conditions that could be aggravated by physical activity.</li>
                    <li>I authorize the university to take necessary action in case of a medical emergency.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Penalties & Disciplinary Actions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Temporary suspension (up to 1 month) for rule violations or equipment misuse.</li>
                    <li>Year-long or permanent suspension for serious misconduct or repeated violations.</li>
                    <li>Users will be charged for any damage caused to tables, nets, or other equipment.</li>
                    <li>The university&apos;s decision regarding penalties is final and binding.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Liability Waiver</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    I understand that use of table tennis facilities is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from its use.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Indoor Games Terms */}
            <Card className="border-0 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Indoor Games Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">General Rules</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Indoor games are available during designated hours and as per slot allocation.</li>
                    <li>Users must handle all equipment (chess sets, carrom boards, foosball tables) with care.</li>
                    <li>No food, drinks, or personal items should be placed on game surfaces.</li>
                    <li>Maintain respectful behavior and sportsmanship during all games.</li>
                    <li>Users are responsible for returning equipment to its original condition after use.</li>
                    <li>Report any damage or issues with equipment immediately to staff.</li>
                    <li>Allow equal access to facilities during busy periods.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Medical Declaration</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>I declare that I am medically fit to participate in indoor games and recreational activities.</li>
                    <li>I authorize the university to take necessary action in case of a medical emergency.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Penalties & Disciplinary Actions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                    <li>Temporary suspension (up to 1 month) for equipment misuse or rule violations.</li>
                    <li>Year-long or permanent suspension for serious misconduct or repeated violations.</li>
                    <li>Users will be charged for any damage caused to games, boards, or equipment.</li>
                    <li>The university&apos;s decision regarding penalties is final and binding.</li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Liability Waiver</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    I understand that use of indoor game facilities is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from their use.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}