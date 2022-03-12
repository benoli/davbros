<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = User::all();
        return $users;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $attributes = ($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'role' => [
                'required', 
                'string',
                // Rule::in(['super', 'admin', 'employee', 'controller'])
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]));
        $attributes['password'] = Hash::make($attributes['password']);
        User::create($attributes);
        return response()->json(['msg' => 'Usuario creado correctamente', 'status' => 'ok'], 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = User::find($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $attributes = ($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'role' => [
                'required', 
                'string',
                // Rule::in(['super', 'admin', 'employee', 'controller'])
            ],
            'password' => ['present'],
        ]));
        $attributes['password'] = Hash::make($attributes['password']);
        $user = User::find($id);
        $user->update($attributes);
        return response()->json(['msg' => 'Usuario actualizado correctamente', 'status' => 'ok'], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = User::where('id', $id);
        $status = $user->delete();
        if ($status != 1) {
            Log::debug('DESTROY SAYS error destroying user => ' . $status);
            return [
                "status"=>"ko", 
                "key" => ["destroyed" => $status == 1?true:false],
                "msg" => "Couldn't destroy the user entry on DB"
            ];
        }
        Log::debug('DESTROY SAYS status of user delete => ' . $status);
        return [
            "status"=>"ok", 
            "key" => ["destroyed" => $status == 1?true:false],
            "msg" => "Usuario eliminado"
        ];
    }

    /**
     * Display a listing of operarios.
     *
     * @return \Illuminate\Http\Response
     */
    public function operarios()
    {
        $operarios = User::where('role', 'employee')->get();
        return $operarios;
    }
}
