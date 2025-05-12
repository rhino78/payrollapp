export const aboutPage = `
    <div class="page">
      <h1 class="about-header"><strong>Release Notes</strong></h1>
      <div id="release-notes"></div>
      <hr>
      <h1 class="about-header"><strong>Database Info</strong></h1>
      <div id="database-info" class="database-info">
          <p class="info-label">Database Location</p>
          <p class="info-value" id="db-location"></p>

          <div style="height: 16px;"></div>

          <p class="info-label">Last Backup</p>
          <p class="info-value" id="last-backup-time">Never</p>

          <div style="height: 16px;"></div>

          <p class="info-label">Number of Backups</p>
          <p class="info-value" id="backup-count">—</p>

        </div>
      <hr>
      <h1 class="about-header"><strong>Backup</strong></h1>
      <button class="backup-now-btn" id="backup-now-btn">
        Backup Now
      </button>
      <div id="backup-status"></div>
    </div>
  `;
