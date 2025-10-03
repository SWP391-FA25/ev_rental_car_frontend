import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';

export function StationDetails({ open, onOpenChange, station, onEdit }) {
  const { t } = useTranslation();

  if (!station) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t('station.details.title')}: {station.name}
          </DialogTitle>
          <DialogDescription>
            {t('station.details.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('station.details.generalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>{t('station.details.name')}</Label>
                <Input value={station.name} disabled />
              </div>
              <div>
                <Label>{t('station.details.location')}</Label>
                <Textarea value={station.location} disabled />
              </div>
              <div>
                <Label>{t('station.details.capacity')}</Label>
                <Input value={station.capacity} disabled />
              </div>
              <div>
                <Label>{t('station.details.status')}</Label>
                <Badge
                  variant={
                    station.status === 'ACTIVE'
                      ? 'default'
                      : station.status === 'INACTIVE'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {station.status === 'ACTIVE'
                    ? t('station.status.active')
                    : station.status === 'INACTIVE'
                      ? t('station.status.inactive')
                      : t('station.status.maintenance')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('station.details.staff')}</CardTitle>
            </CardHeader>
            <CardContent>
              {station.staff && station.staff.length > 0 ? (
                <ul className="list-disc pl-6">
                  {station.staff.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  {t('station.details.noStaff')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Edit Button */}
          <div className="flex justify-end">
            <Button onClick={onEdit}>
              {t('station.details.editButton')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
