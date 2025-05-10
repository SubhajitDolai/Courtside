'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 md:px-0 pt-30">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-sm leading-6">

          <div>
            <h3 className="text-lg font-semibold">General Facility Rules</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Usage is permitted only during designated hours under supervision (if applicable).</li>
              <li>Proper sports attire or swimwear must be worn at all times.</li>
              <li>Users must shower before entering swimming facilities.</li>
              <li>Running, rough play, pushing, wrestling, or reckless actions are strictly prohibited.</li>
              <li>Chewing gum and shoes are not allowed on the pool deck.</li>
              <li>Personal belongings are the user&apos;s responsibility.</li>
              <li>Misconduct or non-compliance with staff instructions may result in disciplinary action.</li>
              <li>Disturbances, inappropriate language, or indecent behavior will lead to immediate removal.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Medical Declaration</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>I declare that I am medically fit to use the facilities and have no known health conditions (e.g., epilepsy, heart issues, infections) that may endanger myself or others.</li>
              <li>I authorize the university to take necessary action in case of a medical emergency.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Penalties & Disciplinary Actions</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Temporary suspension (up to 1 month) for rule violations.</li>
              <li>Permanent suspension or year-long bans for serious or repeated offenses.</li>
              <li>Any damage caused intentionally or due to negligence will be charged to the user.</li>
              <li>The university&apos;s decision in such matters shall be final and binding.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Liability Waiver</h3>
            <p className="mt-2">I understand that the use of the facilities is at my own risk. I shall not hold the university or its staff responsible for any injury, accident, loss, or damage arising from the use of these facilities.</p>
          </div>

          <Separator />

          <p className="text-muted-foreground text-xs">By proceeding to book and use any sports facility, you agree to abide by these terms & conditions.</p>

        </CardContent>
      </Card>
    </div>
  )
}
