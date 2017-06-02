exports.index = {
    auth: {
        strategy: 'jwt',
        mode: 'try',
        scope: ['admin']
    },
    handler: function(request, reply) {
        // console.log("request", request.auth);
        if (!request.auth.credentials || !request.auth.credentials.scope.includes('admin')) {
            return reply("Không có quyền truy cập");
            // return reply.redirect('/admin/dang-nhap');
        }
        return reply.view('admin-dashboard/views/default', {}, { layout: 'admin/layout-admin' });
    },
}