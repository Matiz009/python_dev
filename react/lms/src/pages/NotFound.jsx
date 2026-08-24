import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, Card, EmptyState } from '../components/ui/Primitives.jsx'

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg">
      <EmptyState
        icon={Compass}
        title="That page isn't part of iCAMPUS"
        message="The link may be out of date, or the module has moved. Head back to the control centre."
        action={
          <Link to="/dashboard">
            <Button variant="primary">Go to dashboard</Button>
          </Link>
        }
      />
    </Card>
  )
}
