<?php

class SystemSetting
{
    public string $setting_key;
    public string $setting_value;
    public ?string $updated_at;

    public function __construct(
        string $setting_key,
        string $setting_value,
        ?string $updated_at = null
    ) {
        $this->setting_key = $setting_key;
        $this->setting_value = $setting_value;
        $this->updated_at = $updated_at;
    }

    public function toArray(): array
    {
        return [
            'setting_key' => $this->setting_key,
            'setting_value' => $this->setting_value,
            'updated_at' => $this->updated_at
        ];
    }
}
