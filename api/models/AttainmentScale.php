<?php

class AttainmentScale
{
    public int $id;
    public int $course_id;
    public int $level;
    public float $min_percentage;

    public function __construct(
        int $id,
        int $course_id,
        int $level,
        float $min_percentage
    ) {
        $this->id = $id;
        $this->course_id = $course_id;
        $this->level = $level;
        $this->min_percentage = $min_percentage;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'level' => $this->level,
            'min_percentage' => $this->min_percentage
        ];
    }
}
