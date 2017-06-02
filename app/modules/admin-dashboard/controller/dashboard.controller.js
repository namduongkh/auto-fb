exports.index = {
    auth: {
        strategy: 'jwt',
        mode: 'try',
        scope: ['admin']
    },
    handler: function(request, reply) {
        if (!request.auth.credentials) {
            // return reply("Không có quyền truy cập");
            return reply.redirect('/admin/dang-nhap');
        }
        if (!request.auth.credentials.scope.includes('admin')) {
            return reply("Không có quyền truy cập.");
        }
        return reply.view('admin-dashboard/views/default', {}, { layout: 'admin/layout-admin' });
    },
}