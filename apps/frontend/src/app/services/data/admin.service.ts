import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import {
  AdminGetReportsQuery,
  AdminUpdateUser,
  MapsGetAllAdminQuery,
  MMap,
  Report,
  UpdateReport,
  User,
  PagedResponse,
  MapReview,
  AdminUpdateMapReview,
  UpdateMapAdmin,
  Killswitches,
  AdminGetAdminActivitiesQuery,
  AdminActivity,
  AdminAnnouncement,
  RealTimeSettings
} from '@momentum/constants';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpService);

  updateMap(mapID: number, body: UpdateMapAdmin): Observable<MMap> {
    return this.http.patch(`admin/maps/${mapID}`, { body });
  }

  getMaps(query: MapsGetAllAdminQuery): Observable<PagedResponse<MMap>> {
    return this.http.get<PagedResponse<MMap>>('admin/maps', { query });
  }

  deleteMap(mapID: number): Observable<void> {
    return this.http.delete(`admin/maps/${mapID}`);
  }

  updateUser(userID: number, body: AdminUpdateUser): Observable<void> {
    return this.http.patch(`admin/users/${userID}`, { body });
  }

  resetUserAliasToSteamAlias(userID: number): Observable<void> {
    return this.http.patch(`admin/users/${userID}`, { body: { alias: '' } });
  }

  updateUserAvatarFromSteam(userID: number): Observable<void> {
    return this.http.patch(`admin/users/${userID}`, {
      body: { resetAvatar: true }
    });
  }

  getReports(query?: AdminGetReportsQuery): Observable<PagedResponse<Report>> {
    return this.http.get<PagedResponse<Report>>('admin/reports', { query });
  }

  updateReport(reportID: number, body: UpdateReport): Observable<void> {
    return this.http.patch(`admin/reports/${reportID}`, { body });
  }

  updateAllUserStats(_userStats: object): Observable<never> {
    // Removed
    return EMPTY;
  }

  createUser(alias: string): Observable<User> {
    return this.http.post<User>('admin/users', { body: { alias } });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete(`admin/users/${id}`);
  }

  mergeUsers(placeholder: User, realUser: User): Observable<User> {
    return this.http.post<User>('admin/users/merge', {
      body: {
        placeholderID: placeholder.id,
        userID: realUser.id
      }
    });
  }

  updateMapReview(
    reviewID: number,
    resolved: boolean | null
  ): Observable<MapReview> {
    return this.http.patch<MapReview>(`admin/map-review/${reviewID}`, {
      body: { resolved } as AdminUpdateMapReview
    });
  }

  deleteMapReview(reviewID: number): Observable<void> {
    return this.http.delete(`admin/map-review/${reviewID}`);
  }

  getAdminActivities(
    adminID?: number,
    query?: AdminGetAdminActivitiesQuery
  ): Observable<PagedResponse<AdminActivity>> {
    return this.http.get<PagedResponse<AdminActivity>>(
      'admin/activities' + (adminID ? `/${adminID}` : ''),
      { query }
    );
  }

  getKillswitches(): Observable<Killswitches> {
    return this.http.get('admin/killswitch');
  }

  updateKillswitches(killswitches: Killswitches): Observable<void> {
    return this.http.patch('admin/killswitch', { body: killswitches });
  }

  createAnnouncement(announcement: AdminAnnouncement): Observable<void> {
    return this.http.post('admin/announcement', { body: announcement });
  }

  getRealTimeSettings(): Observable<RealTimeSettings> {
    return this.http.get('real-time/settings');
  }

  setRealTimeSettings(settings: RealTimeSettings): Observable<void> {
    return this.http.patch('real-time/settings', { body: settings });
  }

  setTimerState(timerStart: number | null): Observable<void> {
    return this.http.patch('real-time/timer', { body: { timerStart } });
  }

  nukeRuns(): Observable<void> {
    return this.http.delete('real-time/runs');
  }
}
