# frozen_string_literal: true

#
# Copyright (C) 2011 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

module Canvas::Plugins::Validators::SessionsValidator
  def self.validate(settings, plugin_setting)
    settings_keys = %w[session_timeout mobile_timeout]
    result = {}
    settings_keys.each do |key|
      if settings[key].blank?
        result[key] = nil
        next
      end

      timeout = settings[key].to_f.minutes
      if timeout.to_i < 20.minutes.to_i
        plugin_setting.errors.add(:base, I18n.t("canvas.plugins.errors.login_expiration_minimum",
                                                "Session expiration must be 20 minutes or greater"))
      end
      result[key] = timeout.to_i / 60
    end
    return unless plugin_setting.errors.empty?

    result.with_indifferent_access
  end
end
