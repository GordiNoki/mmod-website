import { Component, OnInit, inject } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AdminService } from '../../../services/data/admin.service';
import { MMap, RealTimeSettings, User } from '@momentum/constants';
import { ColorPickerModule } from 'primeng/colorpicker';
import { HttpErrorResponse } from '@angular/common/http';
import { CardComponent } from '../../../components/card/card.component';
import { UserSearchComponent } from '../../../components/search/user-search.component';
import { SelectModule } from 'primeng/select';
import { UserComponent } from '../../../components/user/user.component';
import { UsersService } from '../../../services/data/users.service';
import { MapSearchComponent } from '../../../components/search/map-search.component';

@Component({
  selector: 'm-real-time',
  imports: [
    ReactiveFormsModule,
    CardComponent,
    UserSearchComponent,
    MapSearchComponent,
    SelectModule,
    ColorPickerModule,
    SelectModule,
    FormsModule,
    CardComponent,
    UserComponent
  ],
  templateUrl: './real-time.component.html'
})
export class RealTimeComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly usersService = inject(UsersService);
  private readonly messageService = inject(MessageService);
  private readonly nnfb = inject(NonNullableFormBuilder);
  protected readonly console = console;

  protected realTimeSettings: RealTimeSettings;
  protected readonly timerSettingsForm = this.nnfb.group({
    team1: this.nnfb.control<number | null>(null),
    team2: this.nnfb.control<number | null>(null),
    allowTimes: this.nnfb.control<boolean>(true),
    mapID: this.nnfb.control<number | null>(null)
  });
  protected readonly teamCreateForm = this.nnfb.group({
    name: this.nnfb.control<string>('', {
      validators: [Validators.required, Validators.minLength(1)]
    }),
    color: this.nnfb.control<string>('ffffff')
  });
  protected teamAssignTeam: number | null = null;
  protected teamAssignUsers: User[] = [];

  ngOnInit() {
    this.adminService.getRealTimeSettings().subscribe({
      next: (settings) => {
        this.realTimeSettings = settings;
        this.timerSettingsForm.setValue(settings);
      },
      error: (httpError: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to get settings!',
          detail: httpError.error.message
        });
      }
    });
  }

  submitTimerSettings() {
    const newSettings = {
      ...this.realTimeSettings,
      team1: this.timerSettingsForm.get('team1').value,
      team2: this.timerSettingsForm.get('team2').value,
      mapID: this.timerSettingsForm.get('mapID').value,
      allowTimes: this.timerSettingsForm.get('allowTimes').value
    };

    this.adminService.setRealTimeSettings(newSettings).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfully updated settings!'
        });
        this.timerSettingsForm.markAsPristine();
        this.realTimeSettings = newSettings;
      },
      error: (httpError: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to update setings!',
          detail: httpError.error.message
        });
      }
    });
  }

  setMap(map: MMap) {
    this.timerSettingsForm.get('mapID').setValue(map.id);
    this.timerSettingsForm.get('mapID').markAsDirty();
  }

  setTimerState() {
    this.adminService.setRealTimeSettings(this.realTimeSettings).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfully update timer state!'
        });
      },
      error: (httpError: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to update timer state!',
          detail: httpError.error.message
        });
      }
    });
  }

  resetTimer() {
    this.realTimeSettings.timerStart = null;
    this.setTimerState();
  }

  startTimer() {
    this.realTimeSettings.timerStart = Date.now();
    this.setTimerState();
  }

  pauseResumeTimer() {
    if (!this.realTimeSettings.pauseTime) {
      this.realTimeSettings.pauseTime = Date.now();
    } else {
      this.realTimeSettings.timerStart +=
        Date.now() - this.realTimeSettings.pauseTime;
      this.realTimeSettings.pauseTime = null;
    }
    this.setTimerState();
  }

  deleteTimes() {
    this.adminService.nukeRuns().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfully deleted current map runs!'
        });
      },
      error: (httpError: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed delete current map runs!',
          detail: httpError.error.message
        });
      }
    });
  }

  createTeam() {
    if (!this.teamCreateForm.valid) return;
    this.realTimeSettings.teams.push({
      name: this.teamCreateForm.get('name').value,
      color: this.teamCreateForm.get('color').value,
      memberIDs: []
    });

    this.adminService.setRealTimeSettings(this.realTimeSettings).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfully added a team!'
        });
        this.teamCreateForm.reset();
      },
      error: (httpError: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to update setings!',
          detail: httpError.error.message
        });
      }
    });
  }

  onTeamSet() {
    this.teamAssignUsers = [];
    const team = this.realTimeSettings.teams[this.teamAssignTeam];
    if (!team || team.memberIDs.length === 0) return;
    this.usersService
      .getUsers({
        userIDs: team.memberIDs,
        take: team.memberIDs.length
      })
      .subscribe({
        next: (users) => {
          this.teamAssignUsers = users.data;
        },
        error: (httpError: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to get team members!',
            detail: httpError.error.message
          });
        }
      });
  }

  addUser(user: User, searchInput: UserSearchComponent): void {
    searchInput.resetSearchBox();
    if (!this.teamAssignUsers.some(({ id }) => id === user.id))
      this.teamAssignUsers.push(user);
  }

  removeUser(userID: number): void {
    const index = this.teamAssignUsers.findIndex(({ id }) => id === userID);
    if (index !== -1) this.teamAssignUsers.splice(index, 1);
  }

  updateTeam() {
    this.realTimeSettings.teams[this.teamAssignTeam].memberIDs =
      this.teamAssignUsers.map((u) => u.id);

    this.adminService.setRealTimeSettings(this.realTimeSettings).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfully updated team members!'
        });
      },
      error: (httpError: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to update team members!',
          detail: httpError.error.message
        });
      }
    });
  }

  get teams() {
    return [
      { id: null, name: '-' },
      ...(this.realTimeSettings?.teams?.map((t, i) => ({
        ...t,
        id: i
      })) ?? [])
    ];
  }
}
