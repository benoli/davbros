<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $default_users = json_decode(file_get_contents(getcwd () . '/database/seeders' . '/default_users.json'), true);
        for ($i=0; $i < count($default_users); $i++) { 
            $default_users[$i]['password'] = Hash::make($default_users[$i]['password']);
            try {
                User::create($default_users[$i]);
            } catch (\Throwable $th) {
                Log::debug('USER SEEDER SAYS => ERROR => ' . $th->getMessage());
            }
        }
    }
}
