'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 md:px-0 pt-30 space-y-10">
      {/* Swimming Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Swimming Pool Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">General Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Swimming is allowed only during designated hours under supervision (if applicable).</li>
              <li>Proper swimwear must be worn at all times.</li>
              <li>Users must shower before entering the pool.</li>
              <li>No running, rough play, pushing, acrobatics, dunking, wrestling, or reckless diving.</li>
              <li>No chewing gum or shoes on the pool deck.</li>
              <li>Users are responsible for their belongings.</li>
              <li>Disturbances, inappropriate language, or indecent behavior will lead to removal.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Medical Declaration</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>I declare that I am medically fit to use the swimming pool and have no health conditions (e.g., epilepsy, heart issues, infections).</li>
              <li>I authorize the university to take necessary action in case of a medical emergency.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Penalties & Disciplinary Actions</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Temporary suspension (up to 1 month) for rule violations.</li>
              <li>Year-long ban or permanent suspension for repeated/serious violations.</li>
              <li>Users are liable for any damage caused to the pool or its equipment.</li>
              <li>The university&apos;s decision is final and binding.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Liability Waiver</h3>
            <p className="mt-2">I understand that use of the swimming pool is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from its use.</p>
          </div>
        </CardContent>
      </Card>

      {/* Badminton Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Badminton Court Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6">
          <div>
            <h3 className="text-lg font-semibold">General Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Court usage is allowed only during designated hours and as per slot allocation.</li>
              <li>Non-marking sports shoes and proper attire are mandatory.</li>
              <li>Players must bring their own rackets and shuttlecocks.</li>
              <li>No spitting, chewing gum, or food inside the court.</li>
              <li>No rough behavior, shouting, or equipment misuse.</li>
              <li>Users are responsible for their belongings.</li>
              <li>Unauthorized access or misuse may lead to disciplinary action.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Medical Declaration</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>I declare that I am medically fit to use the badminton court and have no health conditions (e.g., heart or joint problems, recent injuries).</li>
              <li>I authorize the university to take necessary action in case of a medical emergency.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Penalties & Disciplinary Actions</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Temporary suspension (up to 1 month) for rule violations.</li>
              <li>Year-long or permanent suspension for serious/repeated misconduct.</li>
              <li>Users will be charged for any damage caused by negligence or intentionally.</li>
              <li>The university&apos;s decision is final and binding.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Liability Waiver</h3>
            <p className="mt-2">I understand that use of the badminton court is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from its use.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
